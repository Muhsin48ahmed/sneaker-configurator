import { useEffect, useMemo, useReducer } from 'react'
import { cartReducer, cartTotals, parseStoredCart, serializeCart } from '../domain/cart'

const STORAGE_KEY = 'aero-runner.cart.v1'

/** Storage can throw (private mode, blocked cookies); the cart then simply lives in memory. */
const readStoredCart = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Cart storage unavailable; starting with an empty cart', error)
    return null
  }
}

export const useCart = () => {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () => parseStoredCart(readStoredCart()))

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, serializeCart(cart))
    } catch (error) {
      console.warn('Could not save cart; it will reset on reload', error)
    }
  }, [cart])

  // Another tab changed the cart: adopt its version so this tab doesn't overwrite it with stale data.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) dispatch({ type: 'replace', cart: parseStoredCart(event.newValue) })
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const totals = useMemo(() => cartTotals(cart), [cart])
  return { cart, dispatch, totals } as const
}
