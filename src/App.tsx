import { Suspense, useReducer, useState } from 'react'
import { ArDialog } from './ar/ArDialog'
import { configuratorReducer, createInitialState } from './domain/configurator'
import { useCart } from './hooks/useCart'
import { SneakerStage } from './three/SneakerStage'
import { CartDrawer } from './ui/CartDrawer'
import { ConfiguratorPanel, type AddToCartRequest } from './ui/ConfiguratorPanel'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { IconBag, IconCube } from './ui/icons'

function StageFallback({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="stage stage--fallback" role="alert">
      <p>The 3D preview couldn&apos;t load on this device.</p>
      <p className="stage__fallback-note">You can still pick colors, finishes and your size, and add the pair to your cart.</p>
      <button type="button" className="secondary-button" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(configuratorReducer, undefined, createInitialState)
  const { cart, dispatch: cartDispatch, totals } = useCart()
  const [isCartOpen, setCartOpen] = useState(false)
  const [isArOpen, setArOpen] = useState(false)

  const handleAddToCart = (request: AddToCartRequest) => {
    cartDispatch({ type: 'add', ...request })
    setCartOpen(true)
  }

  const cartLabel = `Cart, ${totals.itemCount} item${totals.itemCount === 1 ? '' : 's'}`

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Aero Studio home">
          AERO<span>studio</span>
        </a>
        <button type="button" className="cart-button" aria-label={cartLabel} onClick={() => setCartOpen(true)}>
          <IconBag />
          {totals.itemCount > 0 && (
            <span className="cart-button__badge" aria-hidden="true">
              {totals.itemCount}
            </span>
          )}
        </button>
      </header>

      <main className="layout">
        <section className="layout__stage" aria-label="3D preview">
          <ErrorBoundary name="3D stage" fallback={(retry) => <StageFallback onRetry={retry} />}>
            <SneakerStage
              design={state.design}
              onSelectPart={(partId) => dispatch({ type: 'selectPart', partId })}
              isPaused={isCartOpen || isArOpen}
              actions={
                <button type="button" className="ar-button" onClick={() => setArOpen(true)}>
                  <IconCube /> View in your room
                </button>
              }
            />
          </ErrorBoundary>
        </section>
        <ConfiguratorPanel state={state} dispatch={dispatch} onAddToCart={handleAddToCart} />
      </main>

      {isCartOpen && (
        <CartDrawer
          cart={cart}
          subtotalCents={totals.subtotalCents}
          dispatch={cartDispatch}
          onClose={() => setCartOpen(false)}
        />
      )}
      {isArOpen && (
        // If the model or AR viewer fails, close quietly; the 3D stage stays usable.
        <ErrorBoundary name="AR dialog" fallback={() => null}>
          <Suspense fallback={null}>
            <ArDialog design={state.design} onClose={() => setArOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}
