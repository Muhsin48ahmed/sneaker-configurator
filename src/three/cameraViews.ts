import type { PartId } from '../domain/catalog'

/**
 * A camera position described the way a photographer would: walk around the shoe
 * (azimuth), raise or lower the camera (polar, 90° = eye level), step back (distance).
 *
 * Model space: the toe points to +x, the heel to −x, the lateral side faces +z,
 * and the shoe is centered on the origin (about 2 × 1 × 0.8 units).
 */
export interface CameraView {
  readonly azimuthDeg: number
  readonly polarDeg: number
  readonly distance: number
  readonly target: readonly [number, number, number]
}

export type LookAt = readonly [number, number, number, number, number, number]

/** Hero three-quarter shot: toe, lateral side and laces all in frame. */
export const OVERVIEW_VIEW: CameraView = { azimuthDeg: -35, polarDeg: 76, distance: 3.9, target: [0, -0.05, 0] }

/** Where the camera starts before gliding in on first load. */
export const INTRO_VIEW: CameraView = { azimuthDeg: -95, polarDeg: 62, distance: 7.5, target: [0, 0, 0] }

/** Close-ups used when a shopper picks a part in the panel. */
export const PART_VIEWS: Readonly<Record<PartId, CameraView>> = {
  mesh: { azimuthDeg: -20, polarDeg: 72, distance: 3.2, target: [0.1, 0, 0] },
  caps: { azimuthDeg: 60, polarDeg: 74, distance: 2.7, target: [0.55, -0.15, 0] },
  stripes: { azimuthDeg: 5, polarDeg: 84, distance: 2.8, target: [0, -0.05, 0] },
  band: { azimuthDeg: -105, polarDeg: 74, distance: 2.6, target: [-0.6, 0.05, 0] },
  patch: { azimuthDeg: 50, polarDeg: 48, distance: 2.6, target: [0.05, 0.3, 0] },
  laces: { azimuthDeg: 20, polarDeg: 38, distance: 2.7, target: [0.25, 0.2, 0] },
  inner: { azimuthDeg: -70, polarDeg: 28, distance: 2.5, target: [-0.35, 0.25, 0] },
  sole: { azimuthDeg: -15, polarDeg: 93, distance: 3.2, target: [0, -0.35, 0] },
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** Converts a view to camera-controls' setLookAt(positionX, Y, Z, targetX, Y, Z) arguments. */
export const viewToLookAt = ({ azimuthDeg, polarDeg, distance, target }: CameraView): LookAt => {
  const azimuth = toRadians(azimuthDeg)
  const polar = toRadians(polarDeg)
  const [tx, ty, tz] = target
  return [
    tx + distance * Math.sin(polar) * Math.sin(azimuth),
    ty + distance * Math.cos(polar),
    tz + distance * Math.sin(polar) * Math.cos(azimuth),
    tx,
    ty,
    tz,
  ]
}
