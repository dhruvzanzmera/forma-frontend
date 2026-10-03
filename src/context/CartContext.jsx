import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { cartService } from '../services/cart'
import { responseData } from '../utils/format'
import { CART_EVENT } from '../utils/cartEvents'

const CartContext = createContext(null)

const deriveCount = (cart) =>
  cart?.itemsCount ??
  cart?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ??
  0

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  const syncCart = useCallback(() => {
    if (!isAuthenticated) {
      setCart(null)
      setCartCount(0)
      return Promise.resolve()
    }
    return cartService
      .get()
      .then((res) => {
        const data = responseData(res)
        setCart(data)
        setCartCount(deriveCount(data))
      })
      .catch(() => {})
  }, [isAuthenticated])

  // Re-sync whenever auth changes or a CART_EVENT is fired
  useEffect(() => {
    syncCart()
  }, [syncCart])

  useEffect(() => {
    window.addEventListener(CART_EVENT, syncCart)
    return () => window.removeEventListener(CART_EVENT, syncCart)
  }, [syncCart])

  /**
   * Call this after any cart mutation (add / update / remove / clear).
   * It re-fetches the cart from the server so the count stays accurate,
   * then fires CART_EVENT so any other listeners (e.g. CartPage) also refresh.
   */
  const refreshCart = useCallback(async () => {
    await syncCart()
    window.dispatchEvent(new Event(CART_EVENT))
  }, [syncCart])

  return (
    <CartContext.Provider value={{ cart, cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
