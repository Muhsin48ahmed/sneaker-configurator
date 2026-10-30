import { useMemo, useRef, useState, type Dispatch } from 'react'
import { PRODUCT, findColor, findPart, type Design, type PartId } from '../domain/catalog'
import type { ConfiguratorAction, ConfiguratorState } from '../domain/configurator'
import { formatPrice, priceDesign } from '../domain/pricing'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { ColorwayPicker } from './ColorwayPicker'
import { FinishPicker } from './FinishPicker'
import { IconBag, IconReset } from './icons'
import { PartTabs } from './PartTabs'
import { partPanelId, partTabId } from './partTabIds'
import { PriceBreakdown } from './PriceBreakdown'
import { SizePicker } from './SizePicker'
import { StepLegend } from './StepLegend'
import { SwatchGrid } from './SwatchGrid'
import { TrustList } from './TrustList'

export interface AddToCartRequest {
  readonly design: Design
  readonly colorwayId: string | null
  readonly sizeId: string
}

interface ConfiguratorPanelProps {
  readonly state: ConfiguratorState
  readonly dispatch: Dispatch<ConfiguratorAction>
  readonly onAddToCart: (request: AddToCartRequest) => void
  /** Called when the shopper picks a part in the panel, so the 3D camera can fly to it. */
  readonly onFocusPart?: (partId: PartId) => void
}

export function ConfiguratorPanel({ state, dispatch, onAddToCart, onFocusPart }: ConfiguratorPanelProps) {
  const { design, colorwayId, selectedPartId, sizeId } = state
  const [isSizeMissing, setSizeMissing] = useState(false)
  const sizeRef = useRef<HTMLFieldSetElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const price = useMemo(() => priceDesign(design), [design])
  const part = findPart(selectedPartId)
  const partStyle = design[selectedPartId]

  const handlePartSelect = (partId: PartId) => {
    dispatch({ type: 'selectPart', partId })
    onFocusPart?.(partId)
  }

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
      <div className="panel__scroll">
        <header className="product-head">
          <p className="product-head__crumbs">Running · Unisex · Custom</p>
          <h1 className="product-head__title">{PRODUCT.name}</h1>
          <p className="product-head__tagline">{PRODUCT.tagline}</p>
          <p className="product-head__price">
            <span>From {formatPrice(PRODUCT.basePriceCents)}</span>
            <span className="badge">Made to order</span>
          </p>
        </header>

        <ColorwayPicker selectedId={colorwayId} onSelect={(id) => dispatch({ type: 'applyColorway', colorwayId: id })} />

        <fieldset className="step">
          <StepLegend step="02" title="Customize" />
          <button type="button" className="text-button step__action" onClick={() => dispatch({ type: 'reset' })}>
            <IconReset /> Reset
          </button>
          <PartTabs design={design} selectedId={selectedPartId} onSelect={handlePartSelect} />
          {part && (
            <div id={partPanelId} role="tabpanel" aria-labelledby={partTabId(part.id)} className="part-panel">
              <SwatchGrid
                partLabel={part.label}
                selectedId={partStyle.colorId}
                onSelect={(colorId) => dispatch({ type: 'setColor', partId: part.id, colorId })}
              />
              <FinishPicker
                partLabel={part.label}
                colorHex={findColor(partStyle.colorId)?.hex ?? '#888888'}
                finishIds={part.finishIds}
                selectedId={partStyle.finishId}
                onSelect={(finishId) => dispatch({ type: 'setFinish', partId: part.id, finishId })}
              />
            </div>
          )}
        </fieldset>

        <SizePicker ref={sizeRef} selectedId={sizeId} hasError={isSizeMissing} onSelect={handleSizeSelect} />
        <PriceBreakdown price={price} />
        <TrustList />
      </div>

      <footer className="panel__footer">
        <div className="panel__total">
          <span className="panel__total-label">Your design</span>
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
