import { useMemo, useRef, useState, type Dispatch } from 'react'
import { PRODUCT, findPart, type Design } from '../domain/catalog'
import type { ConfiguratorAction, ConfiguratorState } from '../domain/configurator'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { formatPrice, priceDesign } from '../domain/pricing'
import { ColorwayPicker } from './ColorwayPicker'
import { FinishPicker } from './FinishPicker'
import { IconBag, IconReset } from './icons'
import { PartTabs } from './PartTabs'
import { partPanelId, partTabId } from './partTabIds'
import { PriceBreakdown } from './PriceBreakdown'
import { SizePicker } from './SizePicker'
import { SwatchGrid } from './SwatchGrid'

export interface AddToCartRequest {
  readonly design: Design
  readonly colorwayId: string | null
  readonly sizeId: string
}

interface ConfiguratorPanelProps {
  readonly state: ConfiguratorState
  readonly dispatch: Dispatch<ConfiguratorAction>
  readonly onAddToCart: (request: AddToCartRequest) => void
}

export function ConfiguratorPanel({ state, dispatch, onAddToCart }: ConfiguratorPanelProps) {
  const { design, colorwayId, selectedPartId, sizeId } = state
  const [isSizeMissing, setSizeMissing] = useState(false)
  const sizeRef = useRef<HTMLFieldSetElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const price = useMemo(() => priceDesign(design), [design])
  const part = findPart(selectedPartId)
  const partStyle = design[selectedPartId]

  const handleSizeSelect = (nextSizeId: string) => {
    setSizeMissing(false)
    dispatch({ type: 'setSize', sizeId: nextSizeId })
  }

  const handleAddToCart = () => {
    if (!sizeId) {
      setSizeMissing(true)
      sizeRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' })
      sizeRef.current?.querySelector('input')?.focus({ preventScroll: true })
      return
    }
    onAddToCart({ design, colorwayId, sizeId })
  }

  return (
    <aside className="panel" aria-label="Customize your sneaker">
      <header className="panel__header">
        <p className="eyebrow">Custom · Made to order</p>
        <h1 className="panel__title">{PRODUCT.name}</h1>
        <p className="panel__tagline">{PRODUCT.tagline}</p>
      </header>

      <div className="panel__body">
        <ColorwayPicker
          selectedId={colorwayId}
          onSelect={(id) => dispatch({ type: 'applyColorway', colorwayId: id })}
        />

        <section className="customizer" aria-label="Customize each part">
          <div className="customizer__heading">
            <h2 className="section-title">Customize each part</h2>
            <button type="button" className="text-button" onClick={() => dispatch({ type: 'reset' })}>
              <IconReset /> Reset
            </button>
          </div>
          <PartTabs
            design={design}
            selectedId={selectedPartId}
            onSelect={(partId) => dispatch({ type: 'selectPart', partId })}
          />
          {part && (
            <div id={partPanelId} role="tabpanel" aria-labelledby={partTabId(part.id)} className="part-panel">
              <SwatchGrid
                partLabel={part.label}
                selectedId={partStyle.colorId}
                onSelect={(colorId) => dispatch({ type: 'setColor', partId: part.id, colorId })}
              />
              <FinishPicker
                partLabel={part.label}
                finishIds={part.finishIds}
                selectedId={partStyle.finishId}
                onSelect={(finishId) => dispatch({ type: 'setFinish', partId: part.id, finishId })}
              />
            </div>
          )}
        </section>

        <SizePicker ref={sizeRef} selectedId={sizeId} hasError={isSizeMissing} onSelect={handleSizeSelect} />
        <PriceBreakdown price={price} />
      </div>

      <footer className="panel__footer">
        <div className="panel__total">
          <span className="panel__total-label">Total</span>
          <span className="panel__total-price" data-testid="total-price">
            {formatPrice(price.totalCents)}
          </span>
        </div>
        <button type="button" className="primary-button" onClick={handleAddToCart}>
          <IconBag /> Add to cart
        </button>
        {isSizeMissing && (
          <p className="panel__error" role="alert">
            Select a size to add this pair to your cart.
          </p>
        )}
      </footer>
    </aside>
  )
}
