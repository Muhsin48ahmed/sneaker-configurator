import type { Ref } from 'react'
import { SIZES } from '../domain/catalog'
import { StepLegend } from './StepLegend'

interface SizePickerProps {
  readonly ref?: Ref<HTMLFieldSetElement>
  readonly selectedId: string | null
  readonly hasError: boolean
  readonly onSelect: (sizeId: string) => void
}

export function SizePicker({ ref, selectedId, hasError, onSelect }: SizePickerProps) {
  return (
    <fieldset ref={ref} className={`step${hasError ? ' step--error' : ''}`} aria-describedby="size-help">
      <StepLegend step="03" title="Size" value={selectedId ? `US ${selectedId}` : 'Select a size'} />
      <div className="sizes">
        {SIZES.map((size) => (
          <label key={size} className="size-option">
            <input
              type="radio"
              className="visually-hidden"
              name="size"
              aria-label={`US ${size}`}
              checked={size === selectedId}
              onChange={() => onSelect(size)}
            />
            <span>{size}</span>
          </label>
        ))}
      </div>
      <p id="size-help" className="field__help">
        Unisex US sizing · fits true to size. Between sizes? Go half a size up.
      </p>
    </fieldset>
  )
}
