import { ContactShadows } from '@react-three/drei'
import { memo } from 'react'

const FLOOR_OFFSET = 0.003
const SHADOW_RESOLUTION = 1024

interface StageShadowsProps {
  readonly floorY: number
}

/**
 * The key spotlight casts the soft, directional shadow. This adds what a spotlight
 * misses: the dark line where the sole actually presses into the floor, which is what
 * makes an object read as sitting on a surface instead of hovering over it.
 * Baked once (frames={1}); memo keeps hover re-renders from re-baking it.
 */
export const StageShadows = memo(function StageShadows({ floorY }: StageShadowsProps) {
  return (
    <group key={floorY} position={[0, floorY + FLOOR_OFFSET, 0]}>
      <ContactShadows scale={4} resolution={SHADOW_RESOLUTION} blur={1.1} far={0.35} opacity={0.95} color="#000000" frames={1} />
    </group>
  )
})
