import { MeshReflectorMaterial } from '@react-three/drei'
import { memo } from 'react'

/** Phones get a smaller reflection buffer: same look, a quarter of the pixels. */
const IS_SMALL_SCREEN = window.matchMedia('(max-width: 640px)').matches
const REFLECTION_RESOLUTION = IS_SMALL_SCREEN ? 512 : 1024
const FLOOR_SIZE = 40
export const FLOOR_COLOR = '#121214'

interface StageFloorProps {
  readonly floorY: number
}

/**
 * Glossy black stage: a blurred, depth-faded mirror like polished resin in a showroom.
 * Reflections fade with distance from the shoe (depth thresholds) so it reads as a
 * surface rather than a perfect mirror, and fog dissolves its far edge into the backdrop.
 */
export const StageFloor = memo(function StageFloor({ floorY }: StageFloorProps) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, floorY, 0]} receiveShadow>
      <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
      <MeshReflectorMaterial
        color={FLOOR_COLOR}
        resolution={REFLECTION_RESOLUTION}
        blur={[420, 120]}
        mixBlur={1}
        mixStrength={4}
        mixContrast={1}
        mirror={0.75}
        depthScale={1.2}
        minDepthThreshold={0.35}
        maxDepthThreshold={1.3}
        roughness={0.85}
        metalness={0.4}
      />
    </mesh>
  )
})
