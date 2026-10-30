import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { configuratorReducer, createInitialState } from '../domain/configurator'
import { ConfiguratorPanel, type AddToCartRequest } from './ConfiguratorPanel'

function Harness({ onAddToCart }: { readonly onAddToCart: (request: AddToCartRequest) => void }) {
  const [state, dispatch] = useReducer(configuratorReducer, undefined, createInitialState)
  return <ConfiguratorPanel state={state} dispatch={dispatch} onAddToCart={onAddToCart} />
}

const setup = () => {
  const onAddToCart = vi.fn<(request: AddToCartRequest) => void>()
  const user = userEvent.setup()
  render(<Harness onAddToCart={onAddToCart} />)
  return { user, onAddToCart }
}

describe('ConfiguratorPanel', () => {
  test('shows the starting colorway and its price', () => {
    setup()

    expect(screen.getByRole('radio', { name: 'Chalk' })).toBeChecked()
    expect(screen.getByTestId('total-price')).toHaveTextContent('$165.00')
  })

  test('recolors the selected part and switches the colorway to Custom', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('tab', { name: /laces/i }))
    await user.click(screen.getByRole('radio', { name: 'Crimson' }))

    expect(screen.getByRole('radio', { name: 'Crimson' })).toBeChecked()
    expect(screen.getByText('Custom design')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /laces/i })).toHaveTextContent('Crimson')
  })

  test('only offers finishes the selected part supports, and prices upgrades', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('tab', { name: /laces/i }))
    const finishes = screen.getByRole('radiogroup', { name: /finish/i })
    expect(within(finishes).getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual([
      'Matte',
      'Metallic',
    ])

    await user.click(within(finishes).getByRole('radio', { name: 'Metallic' }))

    expect(screen.getByTestId('total-price')).toHaveTextContent('$183.00')
  })

  test('asks for a size before adding to cart', async () => {
    const { user, onAddToCart } = setup()

    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(onAddToCart).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/select a size/i)
  })

  test('adds the configured pair with its size', async () => {
    const { user, onAddToCart } = setup()

    await user.click(screen.getByRole('radio', { name: 'Varsity Royal' }))
    await user.click(screen.getByRole('radio', { name: 'US 10' }))
    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(onAddToCart).toHaveBeenCalledTimes(1)
    expect(onAddToCart.mock.calls[0][0]).toMatchObject({ sizeId: '10', colorwayId: 'varsity' })
    expect(onAddToCart.mock.calls[0][0].design.sole).toEqual({ colorId: 'gum', finishId: 'matte' })
  })
})
