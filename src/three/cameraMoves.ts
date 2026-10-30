import type { CameraControlsImpl } from '@react-three/drei'
import type { PartId } from '../domain/catalog'
import { viewToLookAt, type CameraView } from './cameraViews'

/** Seconds camera-controls takes to ease into a new view. */
export const FOCUS_SMOOTH_TIME = 0.4

export interface FocusRequest {
  readonly partId: PartId
  /** Increments on every request so re-selecting the same part still moves the camera. */
  readonly key: number
}

export const moveCamera = (controls: CameraControlsImpl, view: CameraView, animate: boolean) =>
  controls.setLookAt(...viewToLookAt(view), animate)
