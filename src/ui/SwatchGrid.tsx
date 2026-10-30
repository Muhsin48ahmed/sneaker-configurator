import type { CSSProperties } from 'react'
import { COLORS, type ColorId } from '../domain/catalog'
import { IconCheck } from './icons'

interface SwatchGridProps {
  readonly partLabel: string
  readonly selectedId: ColorId
  readonly onSelect: (colorId: ColorId) => void
}

/** Perceived brightness check so the selected tick stays visible on light and dark swatches. */
const LIGHT_SWATCH_THRESHOLD = 160
const isLightColor = (hex: string): boolean => {
  const value = Number.parseInt(hex.slice(1), 16)
  const [r, g, b] = [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
  return 0.299 * r + 0.587 * g + 0.114 * b > LIGHT_SWATCH_THRESHOLD
}

export function SwatchGrid({ partLabel, selectedId, onSelect }: SwatchGridProps) {
  const selectedName = COLORS.find((color) => color.id === selectedId)?.name
  return (
    <fieldset className="field">
      <legend className="field__legend">
        Color <span className="field__value">{selectedName}</span>
      </legend>
      <div className="swatches" role="radiogroup" aria-label={`${partLabel} color`}>
        {COLORS.map((color) => (
          <label
            key={color.id}
            className={`swatch${isLightColor(color.hex) ? ' swatch--light' : ''}`}
            style={{ '--swatch': color.hex } as CSSProperties}
            title={color.name}
          >
            <input
              type="radio"
              className="visually-hidden"
              name="part-color"
              aria-label={color.name}
              checked={color.id === selectedId}
              onChange={() => onSelect(color.id)}
            />
            <span className="swatch__tick" aria-hidden="true">
              <IconCheck />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
