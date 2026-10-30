import { CameraControlsImpl } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import { FOCUS_SMOOTH_TIME, moveCamera, type FocusRequest } from './cameraMoves'
import { INTRO_VIEW, OVERVIEW_VIEW, PART_VIEWS } from './cameraViews'

/** The opening shot eases in more slowly than part-to-part moves. */
const INTRO_SMOOTH_TIME = 0.9
const AUTO_ROTATE_RADIANS_PER_SECOND = 0.22
const MAX_FRAME_DELTA = 1 / 30

interface CameraRigProps {
  readonly controlsRef: RefObject<CameraControlsImpl | null>
  readonly focus: FocusRequest | null
  readonly isAutoRotating: boolean
  readonly prefersReducedMotion: boolean
  /** The model, lighting and floor are all mounted (this rig sits inside their Suspense). */
  readonly onReady: () => void
  readonly onIntroComplete: () => void
}

/**
 * Mounted inside the model's Suspense boundary, so it runs once the shoe is on stage:
 * plays the opening glide, flies to parts on request, and drives idle auto-rotation.
 */
export function CameraRig({
  controlsRef,
  focus,
  isAutoRotating,
  prefersReducedMotion,
  onReady,
  onIntroComplete,
}: CameraRigProps) {
  const invalidate = useThree((state) => state.invalidate)
  const hasPlayedIntro = useRef(false)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || hasPlayedIntro.current) return
    hasPlayedIntro.current = true
    onReady()
    // Pan is pointless in a product viewer: right-drag and two-finger drag do nothing / zoom only.
    controls.mouseButtons.right = CameraControlsImpl.ACTION.NONE
    controls.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY
    controls.touches.three = CameraControlsImpl.ACTION.NONE

    if (prefersReducedMotion) {
      void moveCamera(controls, OVERVIEW_VIEW, false).then(onIntroComplete)
      return
    }
    void moveCamera(controls, INTRO_VIEW, false)
    controls.smoothTime = INTRO_SMOOTH_TIME
    void moveCamera(controls, OVERVIEW_VIEW, true).then(() => {
      controls.smoothTime = FOCUS_SMOOTH_TIME
      onIntroComplete()
    })
  }, [controlsRef, prefersReducedMotion, onReady, onIntroComplete])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || !focus) return
    void moveCamera(controls, PART_VIEWS[focus.partId], !prefersReducedMotion)
  }, [controlsRef, focus, prefersReducedMotion])

  useEffect(() => {
    if (isAutoRotating) invalidate()
  }, [isAutoRotating, invalidate])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls || !isAutoRotating) return
    void controls.rotate(AUTO_ROTATE_RADIANS_PER_SECOND * Math.min(delta, MAX_FRAME_DELTA), 0, false)
    invalidate()
  })

  return null
}
