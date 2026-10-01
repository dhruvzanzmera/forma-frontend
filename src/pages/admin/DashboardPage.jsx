import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";
import { adminDashboardService } from "../../services/adminDashboard";
import { AdminLayout } from "../../layouts/AdminLayout";
import { Busy, Empty, ErrorState } from "../../components/Feedback";
import { getError, money, responseData } from "../../utils/format";

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = () =>
    adminDashboardService
      .get()
      .then((res) => setData(responseData(res)))
      .catch((err) => setError(getError(err)));
  useEffect(() => {
    load();
  }, []);
  if (error)
    return (
      <AdminLayout title="Overview">
        <ErrorState error={error} retry={load} />
      </AdminLayout>
    );
  const overview = data?.overview || {};
  const statuses = data?.ordersByStatus || {};
  const maximum = Math.max(1, ...Object.values(statuses));
  return (
    <AdminLayout title="Overview">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">TUESDAY, 01 OCTOBER 2026</span>
          <h1>Good morning.</h1>
          <p>Here's what's happening at Forma today.</p>
        </div>
        <button className="button dark" onClick={load}>
          Refresh overview <ArrowDown size={14} />
        </button>
      </div>
      {!data ? (
        <Busy />
      ) : (
        <>
          <div className="stats-grid">
            {[
              [
                "Total revenue",
                money(overview.totalRevenue),
                "Across active orders",
              ],
              [
                "Delivered revenue",
                money(overview.deliveredRevenue),
                "Successfully delivered",
              ],
              ["Orders", overview.totalOrders, "All time"],
              ["Customers", overview.totalCustomers, "Registered customers"],
              ["Products", overview.totalProducts, "In your catalog"],
              ["Low stock", overview.lowStockCount, "At five units or less"],
            ].map(([label, value, foot]) => (
              <article className="stat-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{foot}</small>
              </article>
            ))}
          </div>
          <div className="dashboard-grid">
            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">FULFILMENT</span>
                  <h2>Orders by status</h2>
                </div>
                <Link to="/admin/orders">
                  All orders <ArrowRight size={13} />
                </Link>
              </div>
              <div className="bar-chart">
                {Object.entries(statuses).map(([status, count]) => (
                  <div className="chart-row" key={status}>
                    <span>{status.replaceAll("_", " ")}</span>
                    <div>
                      <i
                        style={{
                          width: `${Math.max(2, (count / maximum) * 100)}%`,
                        }}
                      />
                    </div>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">LATEST ACTIVITY</span>
                  <h2>Recent orders</h2>
                </div>
                <Link to="/admin/orders">
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              {data.recentOrders?.length ? (
                data.recentOrders.map((order) => (
                  <Link
                    className="recent-order"
                    to="/admin/orders"
                    key={order._id}
                  >
                    <span className="order-avatar">
                      {order.user?.name?.slice(0, 1) || "C"}
                    </span>
                    <span>
                      <strong>{order.orderNumber}</strong>
                      <small>
                        {order.user?.name || "Customer"} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </small>
                    </span>
                    <strong>{money(order.totalPrice)}</strong>
                  </Link>
                ))
              ) : (
                <Empty
                  title="No orders yet"
                  copy="New orders will appear here."
                />
              )}
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
