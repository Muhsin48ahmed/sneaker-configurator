import type { Camera, Vector3 } from 'three'

/** The subset of OrbitControls we drive from the DOM toolbar (zoom buttons, reset). */
export interface OrbitControlsLike {
  readonly object: Camera
  readonly target: Vector3
  readonly minDistance: number
  readonly maxDistance: number
  update: () => unknown
  reset: () => void
}

/** Moves the camera toward (factor < 1) or away from (factor > 1) the orbit target, within the zoom limits. */
export const dollyBy = (controls: OrbitControlsLike, factor: number): void => {
  const { object: camera, target, minDistance, maxDistance } = controls
  const offset = camera.position.clone().sub(target)
  const distance = Math.min(maxDistance, Math.max(minDistance, offset.length() * factor))
  camera.position.copy(target).add(offset.setLength(distance))
  controls.update()
}
