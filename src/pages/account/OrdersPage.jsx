import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { ordersService } from "../../services/orders";
import { AccountLayout } from "../../layouts/AccountLayout";
import { Busy, Empty, ErrorState } from "../../components/Feedback";
import { getError, imageUrl, money, responseData } from "../../utils/format";

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useSearchParams();
  const load = () =>
    ordersService
      .mine({
        page: params.get("page") || 1,
        limit: 10,
        ...(params.get("status") ? { status: params.get("status") } : {}),
      })
      .then((res) => {
        setOrders(responseData(res) || []);
        setMeta(res.meta);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, [params]);
  return (
    <AccountLayout active="Orders">
      <span className="eyebrow">ACCOUNT / HISTORY</span>
      <h1>Your orders</h1>
      <p className="page-lede">A record of the good things you've chosen.</p>
      <div className="order-history-toolbar">
        <span>{meta?.total ?? orders.length} orders</span>
        <label>
          <span>Show</span>
          <select
            aria-label="Filter orders by status"
            value={params.get("status") || ""}
            onChange={(event) => {
              const next = Object.fromEntries(params);
              delete next.page;
              if (event.target.value) next.status = event.target.value;
              else delete next.status;
              setParams(next);
            }}
          >
            <option value="">All statuses</option>
            {[
              "PENDING",
              "CONFIRMED",
              "PROCESSING",
              "SHIPPED",
              "OUT_FOR_DELIVERY",
              "DELIVERED",
              "CANCELLED",
            ].map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <ErrorState error={error} retry={load} />}
      {loading ? (
        <Busy />
      ) : orders.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Placed</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{money(order.totalPrice)}</td>
                  <td>
                    <span
                      className={`status-pill ${String(order.orderStatus).toLowerCase()}`}
                    >
                      {order.orderStatus?.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>
                    <Link className="table-link" to={`/orders/${order._id}`}>
                      Details <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta?.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() =>
                  setParams({
                    ...Object.fromEntries(params),
                    page: String(meta.page - 1),
                  })
                }
              >
                <ArrowLeft size={14} /> Previous
              </button>
              <span>
                {meta.page} / {meta.totalPages}
              </span>
              <button
                disabled={!meta.hasNextPage}
                onClick={() =>
                  setParams({
                    ...Object.fromEntries(params),
                    page: String(meta.page + 1),
                  })
                }
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <Empty
          title="Your first order is waiting"
          copy="Once you place an order, we'll keep all its details here."
          action={
            <Link className="button dark" to="/products">
              Find something good
            </Link>
          }
        />
      )}
    </AccountLayout>
  );
}

export function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [track, setTrack] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    Promise.all([ordersService.get(id), ordersService.track(id)])
      .then(([orderResponse, trackResponse]) => {
        setOrder(responseData(orderResponse));
        setTrack(responseData(trackResponse));
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const cancel = async () => {
    setCancelling(true);
    setError("");
    try {
      const response = await ordersService.cancel(id, {
        reason: cancelReason.trim(),
      });
      setOrder((current) => ({ ...current, ...responseData(response) }));
      const trackResponse = await ordersService.track(id);
      setTrack(responseData(trackResponse));
      setShowCancelForm(false);
    } catch (err) {
      setError(getError(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="page-wrap">
        <Busy />
      </div>
    );
  if (error)
    return (
      <div className="page-wrap">
        <ErrorState error={error} />
      </div>
    );

  return (
    <div className="page-wrap order-detail">
      <Link className="back-link" to="/orders">
        <ArrowLeft size={15} /> My orders
      </Link>
      <div className="content-heading">
        <div>
          <span className="eyebrow">ORDER / {order?.orderNumber}</span>
          <h1>It's all in motion.</h1>
          <p className="page-lede">
            Placed {new Date(order?.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`status-pill ${String(order?.orderStatus).toLowerCase()}`}
        >
          {order?.orderStatus?.replaceAll("_", " ")}
        </span>
      </div>
      <section className="timeline">
        {track?.timeline?.map((step) => (
          <div
            className={`timeline-step ${step.isCompleted ? "complete" : ""} ${step.isCurrent ? "current" : ""}`}
            key={step.status}
          >
            <span className="timeline-dot">
              {step.isCompleted && <Check size={12} />}
            </span>
            <span>{step.label}</span>
          </div>
        ))}
      </section>
      <div className="order-detail-grid">
        <section>
          <h2>Items ordered</h2>
          {order?.items?.map((item) => (
            <div className="order-item" key={item._id || item.product}>
              <div className="cart-thumb">
                {item.image && (
                  <img src={imageUrl(item.image)} alt={item.name} />
                )}
              </div>
              <div>
                <strong>{item.name}</strong>
                <span>Qty {item.quantity}</span>
              </div>
              <strong>{money(item.subtotal)}</strong>
            </div>
          ))}
          <h2>Delivery address</h2>
          <p>
            {order?.shippingAddress?.fullName}
            <br />
            {order?.shippingAddress?.street}
            <br />
            {order?.shippingAddress?.city}, {order?.shippingAddress?.state}{" "}
            {order?.shippingAddress?.postalCode}
            <br />
            {order?.shippingAddress?.phone}
          </p>
        </section>
        <aside className="summary-panel">
          <span className="eyebrow">PAYMENT / {order?.paymentMethod}</span>
          <div>
            <span>Items</span>
            <span>{money(order?.itemsPrice)}</span>
          </div>
          <div>
            <span>Delivery</span>
            <span>{money(order?.shippingPrice)}</span>
          </div>
          <div>
            <span>Tax</span>
            <span>{money(order?.taxPrice)}</span>
          </div>
          <div className="summary-total">
            <strong>Total</strong>
            <strong>{money(order?.totalPrice)}</strong>
          </div>
          {order?.orderStatus === "PENDING" &&
            (showCancelForm ? (
              <form
                className="cancel-order-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  cancel();
                }}
              >
                <label className="field-label">
                  Cancellation reason{" "}
                  <span>Optional · up to 300 characters</span>
                  <textarea
                    maxLength={300}
                    rows={3}
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    placeholder="Share a reason (optional)"
                  />
                </label>
                <div className="cancel-order-actions">
                  <button
                    className="button secondary"
                    type="button"
                    disabled={cancelling}
                    onClick={() => setShowCancelForm(false)}
                  >
                    Keep order
                  </button>
                  <button
                    className="button cancel-button"
                    disabled={cancelling}
                    type="submit"
                  >
                    {cancelling ? "Cancelling…" : "Confirm cancellation"}
                    <X size={14} />
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="button secondary full"
                onClick={() => setShowCancelForm(true)}
              >
                Cancel order
              </button>
            ))}
        </aside>
      </div>
    </div>
  );
}
