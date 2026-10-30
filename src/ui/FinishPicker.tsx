import type { CSSProperties } from 'react'
import { findFinish, type Finish, type FinishId } from '../domain/catalog'
import { formatPrice } from '../domain/pricing'

interface FinishPickerProps {
  readonly partLabel: string
  readonly colorHex: string
  readonly finishIds: readonly FinishId[]
  readonly selectedId: FinishId
  readonly onSelect: (finishId: FinishId) => void
}

const priceLabel = (finish: Finish) => (finish.priceCents === 0 ? 'Included' : `+${formatPrice(finish.priceCents)}`)

/** Each card previews the finish in the part's current color (see .finish-tile in CSS). */
export function FinishPicker({ partLabel, colorHex, finishIds, selectedId, onSelect }: FinishPickerProps) {
  const finishes = finishIds.map(findFinish).filter((finish): finish is Finish => finish !== undefined)
  return (
    <fieldset className="field">
      <legend className="field__legend">
        Material <span className="field__value">{findFinish(selectedId)?.name}</span>
      </legend>
      <div className="finishes" role="radiogroup" aria-label={`${partLabel} finish`}>
        {finishes.map((finish) => {
          const descriptionId = `finish-${finish.id}-desc`
          return (
            <label key={finish.id} className="finish-option">
              <input
                type="radio"
                className="visually-hidden"
                name="part-finish"
                aria-label={finish.name}
                aria-describedby={descriptionId}
                checked={finish.id === selectedId}
                onChange={() => onSelect(finish.id)}
              />
              <span
                className="finish-tile"
                data-finish={finish.id}
                style={{ '--swatch': colorHex } as CSSProperties}
                aria-hidden="true"
              />
              <span className="finish-option__text">
                <span className="finish-option__name">{finish.name}</span>
                <span id={descriptionId} className="finish-option__desc">
                  {finish.description}
                </span>
              </span>
              <span className="finish-option__price">{priceLabel(finish)}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
