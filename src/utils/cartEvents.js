export const CART_EVENT = "atelier:cart-updated";

/** Broadcast that the cart has changed. CartContext listens for this. */
export const notifyCartChanged = () =>
  window.dispatchEvent(new Event(CART_EVENT));
