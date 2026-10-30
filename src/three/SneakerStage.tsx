import { Center, ContactShadows, Html, OrbitControls, Stats, useProgress } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react'
import { findPart, type Design, type PartId } from '../domain/catalog'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { IconMinus, IconPlus, IconReset, IconRotate } from '../ui/icons'
import { dollyBy } from './cameraControls'
import { SneakerModel } from './SneakerModel'
import { StudioLighting } from './StudioLighting'

/** Front three-quarter view: toe, lateral side and a hint of the laces. */
const CAMERA_POSITION: [number, number, number] = [-2.1, 0.9, 3.0]
/** 45–55° reads as a natural product shot without wide-angle distortion. */
const CAMERA_FOV = 45
/** Clamp device pixel ratio: 3x phones would otherwise render ~2.25x the pixels for little visible gain. */
const DPR_RANGE: [number, number] = [1, 2]
const ZOOM = { min: 2.4, max: 7, step: 0.8 } as const
/** Keep the camera above the floor but low enough to show off the sole profile. */
const POLAR_LIMITS = { min: Math.PI * 0.12, max: Math.PI * 0.56 } as const
const AUTO_ROTATE_SPEED = 1.1
const AUTO_ROTATE_RESUME_MS = 3500
const SHOW_STATS = new URLSearchParams(window.location.search).has('perf')

type ControlsRef = ComponentRef<typeof OrbitControls>

/** OrbitControls only advances auto-rotation inside a frame, so kick the on-demand loop when it turns on. */
function AutoRotateKick({ isActive }: { readonly isActive: boolean }) {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    if (isActive) invalidate()
  }, [isActive, invalidate])
  return null
}

function CanvasLoader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="canvas-loader" role="status">
        <span className="canvas-loader__bar" style={{ transform: `scaleX(${progress / 100})` }} />
        <span>Loading sneaker… {Math.round(progress)}%</span>
      </div>
    </Html>
  )
}

interface SneakerStageProps {
  readonly design: Design
  readonly onSelectPart: (partId: PartId) => void
  /** True while a modal covers the stage: stop auto-rotating so the GPU can idle. */
  readonly isPaused?: boolean
  /** Extra toolbar buttons, e.g. the AR launcher. */
  readonly actions?: ReactNode
}

export function SneakerStage({ design, onSelectPart, isPaused = false, actions }: SneakerStageProps) {
  const controlsRef = useRef<ControlsRef>(null)
  const resumeTimer = useRef<number | undefined>(undefined)
  const prefersReducedMotion = usePrefersReducedMotion()
  // null = follow the OS reduced-motion setting (live); a boolean = the shopper's explicit choice.
  const [autoRotateChoice, setAutoRotateChoice] = useState<boolean | null>(null)
  const isAutoRotateOn = autoRotateChoice ?? !prefersReducedMotion
  const [isInteracting, setInteracting] = useState(false)
  const [hoveredPartId, setHoveredPartId] = useState<PartId | null>(null)
  const [floorY, setFloorY] = useState(0)
  // Stable identity: drei's <Center> re-measures the model whenever this callback changes.
  const handleCentered = useCallback(({ height }: { height: number }) => setFloorY(-height / 2), [])

  useEffect(() => () => window.clearTimeout(resumeTimer.current), [])

  const handleInteractionStart = () => {
    window.clearTimeout(resumeTimer.current)
    setInteracting(true)
  }
  const handleInteractionEnd = () => {
    resumeTimer.current = window.setTimeout(() => setInteracting(false), AUTO_ROTATE_RESUME_MS)
  }

  const zoom = (factor: number) => {
    if (controlsRef.current) dollyBy(controlsRef.current, factor)
  }
  const resetView = () => controlsRef.current?.reset()

  const hoveredLabel = hoveredPartId ? findPart(hoveredPartId)?.label : null
  const isAutoRotating = isAutoRotateOn && !isInteracting && !isPaused

  return (
    <div className="stage">
      <Canvas
        className="stage__canvas"
        frameloop="demand"
        dpr={DPR_RANGE}
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: 0.1, far: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        aria-label="Interactive 3D model of the Aero Runner sneaker"
      >
        <StudioLighting />
        <Suspense fallback={<CanvasLoader />}>
          <Center onCentered={handleCentered}>
            <SneakerModel design={design} onHoverPart={setHoveredPartId} onSelectPart={onSelectPart} />
          </Center>
          {/* Baked once (frames=1): the shoe never moves, only the camera does. Re-keyed if the floor moves. */}
          <ContactShadows
            key={floorY}
            position={[0, floorY, 0]}
            scale={8}
            resolution={512}
            blur={2.4}
            opacity={0.5}
            far={2}
            frames={1}
          />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={ZOOM.min}
          maxDistance={ZOOM.max}
          minPolarAngle={POLAR_LIMITS.min}
          maxPolarAngle={POLAR_LIMITS.max}
          autoRotate={isAutoRotating}
          autoRotateSpeed={AUTO_ROTATE_SPEED}
          onStart={handleInteractionStart}
          onEnd={handleInteractionEnd}
        />
        <AutoRotateKick isActive={isAutoRotating} />
        {SHOW_STATS && <Stats />}
      </Canvas>

      <p className="stage__hint" aria-hidden="true">
        {hoveredLabel ? (
          <>
            Click to edit <strong>{hoveredLabel}</strong>
          </>
        ) : (
          'Drag to rotate · Scroll to zoom · Click a part to edit it'
        )}
      </p>

      <div className="stage__toolbar" role="toolbar" aria-label="3D view controls">
        <button
          type="button"
          className="icon-button"
          aria-pressed={isAutoRotateOn}
          aria-label="Auto-rotate"
          title="Auto-rotate"
          onClick={() => setAutoRotateChoice(!isAutoRotateOn)}
        >
          <IconRotate />
        </button>
        <button type="button" className="icon-button" aria-label="Zoom in" title="Zoom in" onClick={() => zoom(ZOOM.step)}>
          <IconPlus />
        </button>
        <button type="button" className="icon-button" aria-label="Zoom out" title="Zoom out" onClick={() => zoom(1 / ZOOM.step)}>
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
