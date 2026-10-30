import { COLORWAYS, findColor, type PartId } from '../domain/catalog'
import { StepLegend } from './StepLegend'

/** Parts whose colors best summarise a colorway in its card. */
const PREVIEW_PARTS: readonly PartId[] = ['mesh', 'caps', 'stripes', 'sole']

interface ColorwayPickerProps {
  readonly selectedId: string | null
  readonly onSelect: (colorwayId: string) => void
}

export function ColorwayPicker({ selectedId, onSelect }: ColorwayPickerProps) {
  const selectedName = COLORWAYS.find((cw) => cw.id === selectedId)?.name
  return (
    <fieldset className="step">
      <StepLegend step="01" title="Colorway" value={selectedName ?? 'Custom design'} />
      <div className="colorways">
        {COLORWAYS.map((colorway) => (
          <label key={colorway.id} className="colorway-card">
            <input
              type="radio"
              className="visually-hidden"
              name="colorway"
              aria-label={colorway.name}
              checked={colorway.id === selectedId}
              onChange={() => onSelect(colorway.id)}
            />
            <span className="colorway-card__palette" aria-hidden="true">
              {PREVIEW_PARTS.map((partId) => (
                <span key={partId} style={{ background: findColor(colorway.parts[partId].colorId)?.hex }} />
              ))}
            </span>
            <span className="colorway-card__name">{colorway.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
