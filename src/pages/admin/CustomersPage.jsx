import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { adminCustomersService } from "../../services/adminCustomers";
import { AdminLayout } from "../../layouts/AdminLayout";
import { OrdersTable } from "./OrdersPage";
import { Busy, Empty, Notice } from "../../components/Feedback";
import { getError, responseData } from "../../utils/format";

export function AdminCustomers() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    adminCustomersService
      .list({ search, isActive: active || undefined, page, limit: 10 })
      .then((res) => {
        setItems(responseData(res) || []);
        setMeta(res.meta);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [page, active]);
  const toggle = async (customer) => {
    try {
      await adminCustomersService.setStatus(customer._id, {
        isActive: !customer.isActive,
      });
      load();
    } catch (err) {
      setError(getError(err));
    }
  };
  return (
    <AdminLayout title="Customers">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">PEOPLE / CUSTOMER DIRECTORY</span>
          <h1>Customers</h1>
          <p>Know the people who make Forma what it is.</p>
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
            placeholder="Search name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Search</button>
        </form>
        <select
          value={active}
          onChange={(e) => {
            setActive(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All customers</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <Notice>{error}</Notice>
      {loading ? (
        <Busy />
      ) : (
        <div className="table-wrap admin-table">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {items.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <Link
                      className="customer-cell"
                      to={`/admin/customers/${customer._id}`}
                    >
                      <span className="avatar">
                        {customer.name?.slice(0, 1)}
                      </span>
                      <span>
                        <strong>{customer.name}</strong>
                        <small>{customer.email}</small>
                      </span>
                    </Link>
                  </td>
                  <td>{customer.phone || "—"}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`status-pill ${customer.isActive ? "green" : "cancelled"}`}
                      onClick={() => toggle(customer)}
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <Link
                      className="table-link"
                      to={`/admin/customers/${customer._id}/orders`}
                    >
                      View orders <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && (
            <Empty
              title="No customers match"
              copy="Try another search or status filter."
            />
          )}
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
        </div>
      )}
    </AdminLayout>
  );
}

export function AdminCustomerDetail({ ordersOnly = false }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (ordersOnly)
      adminCustomersService
        .orders(id, { page: 1, limit: 10 })
        .then((res) => setOrders(responseData(res) || []))
        .catch((err) => setError(getError(err)));
    else
      adminCustomersService
        .get(id)
        .then((res) => setData(responseData(res)))
        .catch((err) => setError(getError(err)));
  }, [id, ordersOnly]);
  const customer = data?.customer || data;
  return (
    <AdminLayout title={ordersOnly ? "Customer orders" : "Customer details"}>
      <Link className="back-link" to="/admin/customers">
        <ArrowLeft size={15} /> Customers
      </Link>
      <Notice>{error}</Notice>
      {ordersOnly ? (
        <>
          <div className="admin-heading">
            <div>
              <span className="eyebrow">CUSTOMER / HISTORY</span>
              <h1>Order history</h1>
            </div>
          </div>
          <OrdersTable orders={orders} />
        </>
      ) : data ? (
        <>
          <div className="admin-heading">
            <div>
              <span className="eyebrow">CUSTOMER / PROFILE</span>
              <h1>{customer?.name}</h1>
              <p>{customer?.email}</p>
            </div>
            <Link
              className="button secondary"
              to={`/admin/customers/${id}/orders`}
            >
              Order history <ArrowRight size={14} />
            </Link>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Orders placed</span>
              <strong>{data.ordersCount ?? 0}</strong>
              <small>All time</small>
            </article>
            <article className="stat-card">
              <span>Account status</span>
              <strong>{customer?.isActive ? "Active" : "Inactive"}</strong>
              <small>
                {customer?.isEmailVerified
                  ? "Email verified"
                  : "Email not verified"}
              </small>
            </article>
            <article className="stat-card">
              <span>Phone</span>
              <strong>{customer?.phone || "—"}</strong>
              <small>Contact number</small>
            </article>
            <article className="stat-card">
              <span>Joined</span>
              <strong>
                {customer?.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString()
                  : "—"}
              </strong>
              <small>Customer since</small>
            </article>
          </div>
        </>
      ) : (
        <Busy />
      )}
    </AdminLayout>
  );
}
