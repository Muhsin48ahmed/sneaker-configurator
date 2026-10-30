import { formatPrice, type Price } from '../domain/pricing'

export function PriceBreakdown({ price }: { readonly price: Price }) {
  return (
    <details className="price-breakdown">
      <summary>
        Price breakdown
        <span className="price-breakdown__count">
          {price.upcharges.length === 0 ? 'No upgrades' : `${price.upcharges.length} upgrade${price.upcharges.length > 1 ? 's' : ''}`}
        </span>
      </summary>
      <dl>
        <div>
          <dt>Base shoe</dt>
          <dd>{formatPrice(price.baseCents)}</dd>
        </div>
        {price.upcharges.map((upcharge) => (
          <div key={upcharge.partId}>
            <dt>{upcharge.label}</dt>
            <dd>+{formatPrice(upcharge.cents)}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
