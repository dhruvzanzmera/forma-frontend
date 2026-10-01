import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cartService } from "../../services/cart";
import { Busy, Empty, Notice } from "../../components/Feedback";
import { useNotice } from "../../hooks/useNotice";
import {
  getError,
  idOf,
  imageUrl,
  money,
  responseData,
} from "../../utils/format";

export function CartPage({ refreshCart }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, show] = useNotice();
  const load = () =>
    cartService
      .get()
      .then((res) => setCart(responseData(res)))
      .catch((err) => show(getError(err)))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const mutate = async (action) => {
    try {
      await action();
      await load();
      await refreshCart();
    } catch (err) {
      show(getError(err));
    }
  };
  return (
    <div className="page-wrap cart-page">
      <span className="eyebrow">YOUR SELECTION</span>
      <h1>
        Your bag<span>.</span>
      </h1>
      {cart?.items?.length > 0 && (
        <div className="cart-count-line">
          <span>
            {cart.itemsCount ??
              cart.items.reduce((count, item) => count + item.quantity, 0)}{" "}
            pieces in your bag
          </span>
          <span>Prices and availability are confirmed at checkout.</span>
        </div>
      )}
      <Notice>{notice}</Notice>
      {loading ? (
        <Busy />
      ) : cart?.items?.length ? (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item._id || item.productId}>
                <Link className="cart-thumb" to={`/products/${item.slug}`}>
                  {item.image && (
                    <img src={imageUrl(item.image)} alt={item.name} />
                  )}
                </Link>
                <div className="cart-item-info">
                  <Link className="product-name" to={`/products/${item.slug}`}>
                    {item.name}
                  </Link>
                  <span>{money(item.price)} / piece</span>
                  <div className="stepper">
                    <button
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() =>
                        mutate(() =>
                          cartService.update(idOf(item.productId), {
                            quantity: Math.max(1, item.quantity - 1),
                          }),
                        )
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() =>
                        mutate(() =>
                          cartService.update(idOf(item.productId), {
                            quantity: item.quantity + 1,
                          }),
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-line-total">
                  {money(item.subtotal)}
                  <button
                    className="remove-link"
                    onClick={() =>
                      mutate(() => cartService.remove(idOf(item.productId)))
                    }
                  >
                    Remove
                  </button>
                </div>
                {(item.isOutOfStock || item.isQuantityExceeded) && (
                  <p className="stock-warning">
                    Please adjust quantity to available stock (
                    {item.availableStock}).
                  </p>
                )}
              </article>
            ))}
            <button
              className="text-link clear-cart"
              onClick={() =>
                window.confirm("Clear every item from your bag?") &&
                mutate(() => cartService.clear())
              }
            >
              Clear bag
            </button>
          </div>
          <aside className="summary-panel">
            <span className="eyebrow">ORDER SUMMARY</span>
            <div>
              <span>Items</span>
              <span>{money(cart.summary?.itemsPrice)}</span>
            </div>
            <div>
              <span>Delivery</span>
              <span>{money(cart.summary?.shippingPrice)}</span>
            </div>
            <div>
              <span>Tax</span>
              <span>{money(cart.summary?.taxPrice)}</span>
            </div>
            <div className="summary-total">
              <strong>Total</strong>
              <strong>{money(cart.summary?.totalPrice)}</strong>
            </div>
            {cart.hasStockIssue && (
              <p className="stock-warning">
                Review stock issues before checkout.
              </p>
            )}
            <Link className="button dark full" to="/checkout">
              Continue to checkout <ArrowRight size={15} />
            </Link>
            <Link className="continue-shopping" to="/products">
              Continue shopping
            </Link>
          </aside>
        </div>
      ) : (
        <Empty
          title="Your bag is taking a breather"
          copy="When you find something you love, it will be here."
          action={
            <Link className="button dark" to="/products">
              Explore the collection <ArrowRight size={15} />
            </Link>
          }
        />
      )}
    </div>
  );
}
