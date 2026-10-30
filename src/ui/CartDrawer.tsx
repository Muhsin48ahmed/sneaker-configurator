import { useState, type Dispatch } from 'react'
import { MAX_QUANTITY, type CartAction, type CartItem, type CartState } from '../domain/cart'
import { findColorway } from '../domain/catalog'
import { describeDesign } from '../domain/configurator'
import { formatPrice } from '../domain/pricing'
import { useModalDialog } from '../hooks/useModalDialog'
import { IconClose, IconMinus, IconPlus, IconTrash } from './icons'

interface CartDrawerProps {
  readonly cart: CartState
  readonly subtotalCents: number
  readonly dispatch: Dispatch<CartAction>
  readonly onClose: () => void
}

function CartLine({ item, dispatch }: { readonly item: CartItem; readonly dispatch: Dispatch<CartAction> }) {
  const lines = describeDesign(item.design)
  const title = (item.colorwayId && findColorway(item.colorwayId)?.name) || 'Custom design'
  const setQuantity = (quantity: number) => dispatch({ type: 'setQuantity', id: item.id, quantity })

  return (
    <li className="cart-line">
      <div className="cart-line__swatches" aria-hidden="true">
        {lines.slice(0, 4).map((line) => (
          <span key={line.partId} style={{ background: line.colorHex }} />
        ))}
      </div>
      <div className="cart-line__info">
        <p className="cart-line__title">
          Aero Runner · <span>{title}</span>
        </p>
        <p className="cart-line__meta">US {item.sizeId} · {formatPrice(item.unitPriceCents)} each</p>
        <details className="cart-line__specs">
          <summary>View build sheet</summary>
          <ul>
            {lines.map((line) => (
              <li key={line.partId}>
                <span className="dot" style={{ background: line.colorHex }} aria-hidden="true" />
                {line.partLabel}: {line.colorName}, {line.finishName}
              </li>
            ))}
          </ul>
        </details>
        <div className="cart-line__actions">
          <div className="stepper" role="group" aria-label="Quantity">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
              onClick={() => setQuantity(item.quantity - 1)}
            >
              <IconMinus />
            </button>
            <output aria-live="polite">{item.quantity}</output>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={item.quantity >= MAX_QUANTITY}
              onClick={() => setQuantity(item.quantity + 1)}
            >
              <IconPlus />
            </button>
          </div>
          <button type="button" className="text-button" onClick={() => dispatch({ type: 'remove', id: item.id })}>
            <IconTrash /> Remove
          </button>
        </div>
      </div>
      <p className="cart-line__total">{formatPrice(item.unitPriceCents * item.quantity)}</p>
    </li>
  )
}

export function CartDrawer({ cart, subtotalCents, dispatch, onClose }: CartDrawerProps) {
  const { dialogRef, close, backdropHandlers } = useModalDialog()
  const [isCheckoutNoticeShown, setCheckoutNoticeShown] = useState(false)

  return (
    <dialog ref={dialogRef} className="cart-drawer" aria-labelledby="cart-title" onClose={onClose} {...backdropHandlers}>
      <div className="cart-drawer__inner">
        <header className="cart-drawer__header">
          <h2 id="cart-title">Your cart</h2>
          <button type="button" className="icon-button" aria-label="Close cart" onClick={close}>
            <IconClose />
          </button>
        </header>

        {cart.items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
            <button type="button" className="secondary-button" onClick={close}>
              Keep designing
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-drawer__list">
              {cart.items.map((item) => (
                <CartLine key={item.id} item={item} dispatch={dispatch} />
              ))}
            </ul>
            <footer className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotalCents)}</strong>
              </div>
              <p className="cart-drawer__note">Free shipping and 30-day returns. Ships in 3–4 weeks, made to order.</p>
              <button type="button" className="primary-button" onClick={() => setCheckoutNoticeShown(true)}>
                Checkout
              </button>
              {isCheckoutNoticeShown && (
                <p className="cart-drawer__note" role="status">
                  Demo store: checkout isn&apos;t connected to a payment provider.
                </p>
              )}
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
