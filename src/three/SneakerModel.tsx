import { useCursor, useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import type { Design, PartId } from '../domain/catalog'
import { findColor } from '../domain/catalog'
import { surfaceSpec } from '../domain/surface'
import { collectParts } from './collectParts'
import { PartMesh } from './PartMesh'

export const MODEL_URL = '/models/sneaker.glb'
/** Self-hosted Draco decoder (copied from three/examples) so we don't depend on a CDN at runtime. */
export const DRACO_DECODER_PATH = '/draco/'

const FALLBACK_HEX = '#888888'

interface SneakerModelProps {
  readonly design: Design
  readonly onHoverPart: (partId: PartId | null) => void
  readonly onSelectPart: (partId: PartId) => void
}

export function SneakerModel({ design, onHoverPart, onSelectPart }: SneakerModelProps) {
  const { scene } = useGLTF(MODEL_URL, DRACO_DECODER_PATH)
  const parts = useMemo(() => collectParts(scene), [scene])
  const [hoveredPartId, setHoveredPartId] = useState<PartId | null>(null)
  const invalidate = useThree((state) => state.invalidate)
  useCursor(hoveredPartId !== null)

  // frameloop="demand" only draws when asked; ask once the model has mounted.
  useEffect(() => invalidate(), [parts, invalidate])

  const handleHover = (partId: PartId | null) => {
    setHoveredPartId(partId)
    onHoverPart(partId)
  }

  return (
    <group>
      {parts.map((part) => {
        const { colorId, finishId } = design[part.partId]
        const spec = surfaceSpec(findColor(colorId)?.hex ?? FALLBACK_HEX, finishId)
        return (
          <PartMesh
            key={part.key}
            part={part}
            spec={spec}
            isHovered={hoveredPartId === part.partId}
            onHover={handleHover}
            onSelect={onSelectPart}
          />
        )
      })}
    </group>
  )
}

// Start fetching + decoding the model while React is still mounting the rest of the page.
useGLTF.preload(MODEL_URL, DRACO_DECODER_PATH)
