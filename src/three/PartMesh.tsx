import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Color, type MeshPhysicalMaterial } from 'three'
import type { PartId } from '../domain/catalog'
import type { SurfaceSpec } from '../domain/surface'
import type { ModelPart } from './collectParts'

/** Higher = snappier color fades. ~10/s settles in about 300 ms. */
const COLOR_DAMPING_PER_SECOND = 10
/** In on-demand rendering the first delta after idle can be seconds long; clamp it so fades still animate. */
const MAX_FRAME_DELTA = 1 / 30
const COLOR_SETTLE_EPSILON = 0.002
/** Pointer travel (px) above which a click is treated as the end of an orbit drag. */
const DRAG_THRESHOLD_PX = 4
const HOVER_GLOW = 0.07

interface PartMeshProps {
  readonly part: ModelPart
  readonly spec: SurfaceSpec
  readonly isHovered: boolean
  readonly onHover: (partId: PartId | null) => void
  readonly onSelect: (partId: PartId) => void
}

const colorDistance = (a: Color, b: Color) => Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b)

export function PartMesh({ part, spec, isHovered, onHover, onSelect }: PartMeshProps) {
  const materialRef = useRef<MeshPhysicalMaterial>(null)
  const invalidate = useThree((state) => state.invalidate)
  // Color is animated imperatively below; React only sets the starting value.
  const [initialColor] = useState(spec.color)
  const targetColor = useMemo(() => new Color(spec.color), [spec.color])

  useEffect(() => invalidate(), [targetColor, invalidate])

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material || material.color.equals(targetColor)) return
    const step = 1 - Math.exp(-COLOR_DAMPING_PER_SECOND * Math.min(delta, MAX_FRAME_DELTA))
    material.color.lerp(targetColor, step)
    if (colorDistance(material.color, targetColor) < COLOR_SETTLE_EPSILON) material.color.copy(targetColor)
    invalidate()
  })

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    onHover(part.partId)
  }
  const handlePointerOut = () => onHover(null)
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    // Touch has no "pointer out" after a tap, so clear the hover glow ourselves.
    if ('pointerType' in event.nativeEvent && event.nativeEvent.pointerType === 'touch') onHover(null)
    if (event.delta > DRAG_THRESHOLD_PX) return
    onSelect(part.partId)
  }

  const hasSheen = spec.sheenColor !== '#000000'

  return (
    <mesh
      geometry={part.geometry}
      position={part.position}
      quaternion={part.quaternion}
      scale={part.scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <meshPhysicalMaterial
        ref={materialRef}
        color={initialColor}
        roughness={spec.roughness}
        metalness={spec.metalness}
        clearcoat={spec.clearcoat}
        clearcoatRoughness={spec.clearcoatRoughness}
        sheen={hasSheen ? 1 : 0}
        sheenColor={spec.sheenColor}
        sheenRoughness={spec.sheenRoughness}
        normalMap={part.normalMap}
        normalScale={part.normalScale}
        aoMap={part.aoMap}
        side={part.side}
        emissive="#ffffff"
        emissiveIntensity={isHovered ? HOVER_GLOW : 0}
      />
    </mesh>
  )
}
