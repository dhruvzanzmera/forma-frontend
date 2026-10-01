import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { addressesService } from "../../services/addresses";
import { ordersService } from "../../services/orders";
import { Busy, Empty, Notice } from "../../components/Feedback";
import { getError, money, responseData } from "../../utils/format";

export function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    addressesService
      .list()
      .then((res) => {
        const list = responseData(res) || [];
        setAddresses(list);
        const preferred = list.find((item) => item.isDefault) || list[0];
        if (preferred) setAddressId(preferred._id);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (addressId)
      ordersService
        .checkoutSummary(addressId)
        .then((res) => setSummary(responseData(res)))
        .catch((err) => setError(getError(err)));
  }, [addressId]);
  const placeOrder = async () => {
    setBusy(true);
    try {
      const res = await ordersService.place({
        addressId,
        paymentMethod: "COD",
      });
      navigate("/order-success", { state: { order: responseData(res) } });
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };
  if (loading)
    return (
      <div className="page-wrap">
        <Busy label="Preparing checkout" />
      </div>
    );
  return (
    <div className="page-wrap checkout-page">
      <div className="breadcrumb">
        <Link to="/cart">Your bag</Link>
        <span>/</span>
        <span>Checkout</span>
      </div>
      <nav className="checkout-progress" aria-label="Checkout progress">
        <Link to="/cart" className="complete">
          <span>01</span> Bag
        </Link>
        <span className="current" aria-current="step">
          <span>02</span> Delivery
        </span>
        <span>
          <span>03</span> Confirmation
        </span>
      </nav>
      <span className="eyebrow">ALMOST YOURS</span>
      <h1>
        Make it yours<span>.</span>
      </h1>
      <Notice>{error}</Notice>
      <div className="checkout-layout">
        <section>
          <div className="checkout-section-title">
            <span>01</span>
            <div>
              <h2>Delivery address</h2>
              <p>Where should we send your order?</p>
            </div>
          </div>
          {addresses.length ? (
            <div className="checkout-addresses">
              {addresses.map((address) => (
                <label
                  className={`checkout-address ${addressId === address._id ? "selected" : ""}`}
                  key={address._id}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === address._id}
                    onChange={() => setAddressId(address._id)}
                  />
                  <span>
                    <strong>
                      {address.fullName}{" "}
                      {address.isDefault && <small>DEFAULT</small>}
                    </strong>
                    <span>
                      {address.street}, {address.city}, {address.state}{" "}
                      {address.postalCode}
                    </span>
                    <span>{address.phone}</span>
                  </span>
                  <Check size={16} />
                </label>
              ))}
            </div>
          ) : (
            <Empty
              title="Add a delivery address first"
              copy="You need a saved address before checkout."
              action={
                <Link className="button dark" to="/addresses/new">
                  Add address
                </Link>
              }
            />
          )}
          <Link className="text-link add-address-link" to="/addresses/new">
            + Add another address
          </Link>
          <div className="checkout-section-title payment-title">
            <span>02</span>
            <div>
              <h2>Payment method</h2>
              <p>Simple, secure, on arrival.</p>
            </div>
          </div>
          <div className="payment-choice">
            <span className="cod-icon">₹</span>
            <div>
              <strong>Cash on delivery</strong>
              <span>Pay when your order reaches you</span>
            </div>
            <Check size={17} />
          </div>
        </section>
        <aside className="summary-panel checkout-summary">
          <span className="eyebrow">YOUR ORDER</span>
          {summary && (
            <div
              className={`checkout-readiness ${summary.isReadyForCheckout ? "ready" : "needs-attention"}`}
            >
              <span className="readiness-dot" />
              {summary.isReadyForCheckout
                ? "Stock confirmed"
                : "Review availability"}
            </div>
          )}
          {summary?.cart?.items?.map((item) => (
            <div className="summary-product" key={item.productId}>
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>{money(item.subtotal)}</span>
            </div>
          ))}
          <div>
            <span>Items</span>
            <span>{money(summary?.cart?.summary?.itemsPrice)}</span>
          </div>
          <div>
            <span>Delivery</span>
            <span>{money(summary?.cart?.summary?.shippingPrice)}</span>
          </div>
          <div>
            <span>Tax</span>
            <span>{money(summary?.cart?.summary?.taxPrice)}</span>
          </div>
          <div className="summary-total">
            <strong>Total</strong>
            <strong>{money(summary?.cart?.summary?.totalPrice)}</strong>
          </div>
          <button
            className="button dark full"
            disabled={!addressId || !summary?.isReadyForCheckout || busy}
            onClick={placeOrder}
          >
            {busy ? "Placing order…" : "Place COD order"}{" "}
            <ArrowRight size={15} />
          </button>
          <p className="secure-note">
            <ShieldCheck size={14} /> Your details are kept secure.
          </p>
        </aside>
      </div>
    </div>
  );
}
