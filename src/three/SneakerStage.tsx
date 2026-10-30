import { CameraControls, Center, Stats, useProgress, type CameraControlsImpl } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Selection } from '@react-three/postprocessing'
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { findPart, type Design, type PartId } from '../domain/catalog'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { IconMinus, IconPlus, IconReset, IconRotate } from '../ui/icons'
import { FOCUS_SMOOTH_TIME, moveCamera, type FocusRequest } from './cameraMoves'
import { CameraRig } from './CameraRig'
import { INTRO_VIEW, OVERVIEW_VIEW, viewToLookAt } from './cameraViews'
import { SneakerModel } from './SneakerModel'
import { StageEffects } from './StageEffects'
import { StageFloor } from './StageFloor'
import { StageShadows } from './StageShadows'
import { StudioLighting } from './StudioLighting'

/** Black stage; fog fades the reflective floor into it. Matches --color-stage in CSS. */
const STAGE_BACKGROUND = '#0b0b0c'
const FOG_RANGE: [number, number] = [7, 16]
const INTRO_POSITION = viewToLookAt(INTRO_VIEW).slice(0, 3) as [number, number, number]
/** 45–55° reads as a natural product shot without wide-angle distortion. */
const CAMERA_FOV = 42
/** Clamp device pixel ratio: 3x phones would otherwise render ~2.25x the pixels for little visible gain. */
const DPR_RANGE: [number, number] = [1, 2]
const ZOOM = { min: 2.2, max: 7.5, step: 0.6 } as const
/** Keep the camera above the floor but low enough to show off the sole profile. */
const POLAR_LIMITS = { min: Math.PI * 0.12, max: Math.PI * 0.53 } as const
const AUTO_ROTATE_RESUME_MS = 3500
const SHOW_STATS = new URLSearchParams(window.location.search).has('perf')

/**
 * Plain DOM overlay rather than drei <Html> inside the canvas: <Html> as a Suspense fallback
 * unmounts its own React root mid-render when loading finishes, which React 19 rejects.
 * useProgress reads three's global loading manager, so it works outside the Canvas.
 */
function StageLoader({ isVisible }: { readonly isVisible: boolean }) {
  const { progress } = useProgress()
  return (
    <div className={`stage-loader${isVisible ? '' : ' stage-loader--done'}`} role="status" aria-hidden={!isVisible}>
      <span className="canvas-loader__track">
        <span className="canvas-loader__bar" style={{ transform: `scaleX(${progress / 100})` }} />
      </span>
      <span>Preparing your sneaker · {Math.round(progress)}%</span>
    </div>
  )
}

interface SneakerStageProps {
  readonly design: Design
  readonly selectedPartId: PartId
  readonly focus: FocusRequest | null
  readonly onSelectPart: (partId: PartId) => void
  /** True while a modal covers the stage: stop auto-rotating so the GPU can idle. */
  readonly isPaused?: boolean
  /** Extra toolbar buttons, e.g. the AR launcher. */
  readonly actions?: ReactNode
}

export function SneakerStage({ design, selectedPartId, focus, onSelectPart, isPaused = false, actions }: SneakerStageProps) {
  const controlsRef = useRef<CameraControlsImpl>(null)
  const resumeTimer = useRef<number | undefined>(undefined)
  const prefersReducedMotion = usePrefersReducedMotion()
  // The shopper's explicit toggle, tagged with the focus request it was made under. A newer
  // focus (inspecting a part) overrides it and holds the camera still; with no choice and no
  // focus, auto-rotate follows the OS reduced-motion setting live.
  const [autoRotateChoice, setAutoRotateChoice] = useState<{ isOn: boolean; focusKey: number } | null>(null)
  const focusKey = focus?.key ?? 0
  const isAutoRotateOn =
    autoRotateChoice && autoRotateChoice.focusKey === focusKey
      ? autoRotateChoice.isOn
      : focus === null && !prefersReducedMotion
  const [isInteracting, setInteracting] = useState(false)
  const [isIntroDone, setIntroDone] = useState(false)
  const [isSceneReady, setSceneReady] = useState(false)
  const [hoveredPartId, setHoveredPartId] = useState<PartId | null>(null)
  const [floorY, setFloorY] = useState(0)
  // Stable identities: drei's <Center> re-measures, and the rig re-runs effects, when these change.
  const handleCentered = useCallback(({ height }: { height: number }) => setFloorY(-height / 2), [])
  const handleIntroComplete = useCallback(() => setIntroDone(true), [])
  const handleSceneReady = useCallback(() => setSceneReady(true), [])

  useEffect(() => () => window.clearTimeout(resumeTimer.current), [])

  const handleInteractionStart = () => {
    window.clearTimeout(resumeTimer.current)
    setInteracting(true)
  }
  const handleInteractionEnd = () => {
    resumeTimer.current = window.setTimeout(() => setInteracting(false), AUTO_ROTATE_RESUME_MS)
  }

  const zoom = (amount: number) => void controlsRef.current?.dolly(amount, !prefersReducedMotion)
  const resetView = () => {
    if (controlsRef.current) void moveCamera(controlsRef.current, OVERVIEW_VIEW, !prefersReducedMotion)
  }

  const isAutoRotating = isAutoRotateOn && isIntroDone && !isInteracting && !isPaused
  const hoveredLabel = hoveredPartId ? findPart(hoveredPartId)?.label : null
  const selectedLabel = findPart(selectedPartId)?.label

  return (
    <div className="stage">
      <Canvas
        className="stage__canvas"
        shadows="percentage"
        frameloop="demand"
        dpr={DPR_RANGE}
        camera={{ position: INTRO_POSITION, fov: CAMERA_FOV, near: 0.1, far: 50 }}
        gl={{ antialias: false, stencil: false, powerPreference: 'high-performance' }}
        aria-label="Interactive 3D model of the Aero Runner sneaker"
      >
        <color attach="background" args={[STAGE_BACKGROUND]} />
        <fog attach="fog" args={[STAGE_BACKGROUND, ...FOG_RANGE]} />
        <Selection>
          <Suspense fallback={null}>
            <StudioLighting />
            <Center onCentered={handleCentered}>
              <SneakerModel design={design} onHoverPart={setHoveredPartId} onSelectPart={onSelectPart} />
            </Center>
            <StageFloor floorY={floorY} />
            <StageShadows floorY={floorY} />
            <CameraRig
              controlsRef={controlsRef}
              focus={focus}
              isAutoRotating={isAutoRotating}
              prefersReducedMotion={prefersReducedMotion}
              onReady={handleSceneReady}
              onIntroComplete={handleIntroComplete}
            />
          </Suspense>
          <StageEffects />
        </Selection>
        <CameraControls
          ref={controlsRef}
          makeDefault
          minDistance={ZOOM.min}
          maxDistance={ZOOM.max}
          minPolarAngle={POLAR_LIMITS.min}
          maxPolarAngle={POLAR_LIMITS.max}
          smoothTime={FOCUS_SMOOTH_TIME}
          draggingSmoothTime={0.12}
          onStart={handleInteractionStart}
          onEnd={handleInteractionEnd}
        />
        {SHOW_STATS && <Stats />}
      </Canvas>

      <StageLoader isVisible={!isSceneReady} />

      <span className="stage__watermark" aria-hidden="true">
        AERO
      </span>

      <div className="stage__chip" aria-live="polite">
        <span className="stage__chip-label">Editing</span>
        <span className="stage__chip-value">{selectedLabel}</span>
      </div>

      <p className="stage__hint" aria-hidden="true">
        {hoveredLabel ? (
          <>
            Click to edit <strong>{hoveredLabel}</strong>
          </>
        ) : (
          'Drag to rotate · Scroll to zoom · Click any part'
        )}
      </p>

      <div className="stage__toolbar" role="toolbar" aria-label="3D view controls">
        <button
          type="button"
          className="icon-button"
          aria-pressed={isAutoRotateOn}
          aria-label="Auto-rotate"
          title="Auto-rotate"
          onClick={() => setAutoRotateChoice({ isOn: !isAutoRotateOn, focusKey })}
        >
          <IconRotate />
        </button>
        <button type="button" className="icon-button" aria-label="Zoom in" title="Zoom in" onClick={() => zoom(ZOOM.step)}>
          <IconPlus />
        </button>
        <button type="button" className="icon-button" aria-label="Zoom out" title="Zoom out" onClick={() => zoom(-ZOOM.step)}>
          <IconMinus />
        </button>
        <button type="button" className="icon-button" aria-label="Reset view" title="Reset view" onClick={resetView}>
          <IconReset />
        </button>
        {actions}
      </div>
    </div>
  )
}
