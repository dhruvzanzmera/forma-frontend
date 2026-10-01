import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { adminOrdersService } from "../../services/adminOrders";
import { AdminLayout } from "../../layouts/AdminLayout";
import { Busy, Empty, Notice } from "../../components/Feedback";
import { getError, money, responseData } from "../../utils/format";

export function OrdersTable({ orders }) {
  const [updates, setUpdates] = useState({});
  const [pending, setPending] = useState({});
  const [error, setError] = useState("");
  const updateStatus = async (order, status) => {
    const key = `${order._id}:orderStatus`;
    setPending((current) => ({ ...current, [key]: true }));
    try {
      await adminOrdersService.updateStatus(order._id, {
        status,
        reason: null,
      });
      setUpdates((current) => ({
        ...current,
        [order._id]: { ...current[order._id], orderStatus: status },
      }));
    } catch (err) {
      setError(getError(err));
    } finally {
      setPending((current) => ({ ...current, [key]: false }));
    }
  };
  const updatePayment = async (order, paymentStatus) => {
    const key = `${order._id}:paymentStatus`;
    setPending((current) => ({ ...current, [key]: true }));
    try {
      await adminOrdersService.updatePaymentStatus(order._id, {
        paymentStatus,
      });
      setUpdates((current) => ({
        ...current,
        [order._id]: { ...current[order._id], paymentStatus },
      }));
    } catch (err) {
      setError(getError(err));
    } finally {
      setPending((current) => ({ ...current, [key]: false }));
    }
  };
  return (
    <>
      <Notice>{error}</Notice>
      <div className="table-wrap admin-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Order status</th>
              <th>Payment status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const current = { ...order, ...updates[order._id] };
              const orderStatusKey = `${order._id}:orderStatus`;
              const paymentStatusKey = `${order._id}:paymentStatus`;
              return (
                <tr key={order._id}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td>
                    {order.user?.name || "Customer"}
                    <small className="cell-sub">
                      {order.user?.email || ""}
                    </small>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{money(order.totalPrice)}</td>
                  <td>
                    <select
                      aria-label={`Order status for ${order.orderNumber}`}
                      className={`order-status-select ${String(current.orderStatus).toLowerCase()}`}
                      disabled={Boolean(pending[orderStatusKey])}
                      value={current.orderStatus}
                      onChange={(event) =>
                        updateStatus(order, event.target.value)
                      }
                    >
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
                  </td>
                  <td>
                    <select
                      aria-label={`Payment status for ${order.orderNumber}`}
                      className={`order-status-select ${String(current.paymentStatus).toLowerCase()}`}
                      disabled={Boolean(pending[paymentStatusKey])}
                      value={current.paymentStatus}
                      onChange={(event) =>
                        updatePayment(order, event.target.value)
                      }
                    >
                      {["PENDING", "PAID", "FAILED", "REFUNDED"].map(
                        (status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!orders.length && (
          <Empty
            title="No matching orders"
            copy="New orders will appear here."
          />
        )}
      </div>
    </>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    adminOrdersService
      .list({
        search: search || undefined,
        orderStatus: status || undefined,
        paymentStatus: paymentStatus || undefined,
        page,
        limit: 15,
      })
      .then((res) => {
        setOrders(responseData(res) || []);
        setMeta(res.meta);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [page, status, paymentStatus]);
  return (
    <AdminLayout title="Orders">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">FULFILMENT / ORDER DESK</span>
          <h1>Orders</h1>
          <p>From first click to front door.</p>
        </div>
      </div>
      <div className="admin-toolbar">
        <form
          className="table-search"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            load();
          }}
        >
          <Search size={15} />
          <input
            placeholder="Order number or customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Search</button>
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All order statuses</option>
          {[
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All payments</option>
          {["PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {error && <Notice>{error}</Notice>}
      {loading ? <Busy /> : <OrdersTable orders={orders} />}
      {meta && (
        <div className="pagination">
          <button
            disabled={!meta.hasPrevPage}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            {meta.page} / {meta.totalPages}
          </span>
          <button
            disabled={!meta.hasNextPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </AdminLayout>
  );
}

export function AdminOrderDetails() {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    adminOrdersService
      .list({ page: 1, limit: 50 })
      .then((res) => {
        const all = responseData(res) || [];
        const match = all.find((item) => item._id === id);
        if (match) setOrders([match]);
        else
          setError(
            "Order is not included in the first page of results. Find it using order search.",
          );
      })
      .catch((err) => setError(getError(err)));
  }, [id]);
  return (
    <AdminLayout title="Order details">
      <Link className="back-link" to="/admin/orders">
        <ArrowLeft size={15} /> Orders
      </Link>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">FULFILMENT / DETAIL</span>
          <h1>Order details</h1>
          <p>
            The documented admin API provides order lists and status updates,
            but no single-order detail endpoint.
          </p>
        </div>
      </div>
      {error && <Notice>{error}</Notice>}
      {orders.length > 0 && <OrdersTable orders={orders} />}
    </AdminLayout>
  );
}
