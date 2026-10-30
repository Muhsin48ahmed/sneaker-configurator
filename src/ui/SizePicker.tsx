import type { Ref } from 'react'
import { SIZES } from '../domain/catalog'

interface SizePickerProps {
  readonly ref?: Ref<HTMLFieldSetElement>
  readonly selectedId: string | null
  readonly hasError: boolean
  readonly onSelect: (sizeId: string) => void
}

export function SizePicker({ ref, selectedId, hasError, onSelect }: SizePickerProps) {
  return (
    <fieldset ref={ref} className={`field${hasError ? ' field--error' : ''}`} aria-describedby="size-help">
      <legend className="field__legend">
        Size <span className="field__value">{selectedId ? `US ${selectedId}` : 'Select'}</span>
      </legend>
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
        US men's sizing. Fits true to size.
      </p>
    </fieldset>
  )
}
