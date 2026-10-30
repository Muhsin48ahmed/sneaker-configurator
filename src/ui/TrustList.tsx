import { IconClock, IconReturn, IconTruck } from './icons'

export function TrustList() {
  return (
    <ul className="trust-list">
      <li>
        <IconTruck />
        <span>
          <strong>Free shipping</strong> on every custom pair
        </span>
      </li>
      <li>
        <IconReturn />
        <span>
          <strong>30-day returns</strong>, even on custom designs
        </span>
      </li>
      <li>
        <IconClock />
        <span>
          <strong>Made to order</strong> · ships in 3–4 weeks
        </span>
      </li>
    </ul>
  )
}
