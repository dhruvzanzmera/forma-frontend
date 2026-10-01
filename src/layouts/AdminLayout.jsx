import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menu ? "open" : ""}`}>
        <Link className="wordmark" to="/admin">
          FORMA<span>.</span>
        </Link>
        <span className="admin-label">WORKSPACE</span>
        <nav>
          <Link to="/admin">
            <LayoutDashboard size={16} /> Overview
          </Link>
          <Link to="/admin/products">
            <Package size={16} /> Products
          </Link>
          <Link to="/admin/categories">
            <Sparkles size={16} /> Categories
          </Link>
          <Link to="/admin/customers">
            <CircleUserRound size={16} /> Customers
          </Link>
          <Link to="/admin/orders">
            <ShoppingBag size={16} /> Orders
          </Link>
        </nav>
        <div className="admin-user">
          <div className="avatar">
            {user?.name?.slice(0, 1)?.toUpperCase() || "A"}
          </div>
          <div>
            <strong>{user?.name}</strong>
            <span>Administrator</span>
          </div>
          <button
            className="icon-button"
            aria-label="Sign out"
            onClick={logout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="icon-button admin-menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle sidebar"
          >
            <Menu />
          </button>
          <div>
            <span className="eyebrow">FORMA / OPERATIONS</span>
            <strong>{title}</strong>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
