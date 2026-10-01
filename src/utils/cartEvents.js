export const CART_EVENT = "atelier:cart-updated";

export const notifyCartChanged = () =>
  window.dispatchEvent(new Event(CART_EVENT));
