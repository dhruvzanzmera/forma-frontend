import { Link } from "react-router-dom";
import { ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AccountLayout({ children, active = "" }) {
  const { user, logout } = useAuth();
  const nav = [
    ["/profile", "Overview"],
    ["/addresses", "Addresses"],
    ["/orders", "Orders"],
    ["/change-password", "Password"],
  ];
  return (
    <div className="account-layout page-wrap">
      <aside className="account-sidebar">
        <span className="eyebrow">YOUR ACCOUNT</span>
        <div className="account-greeting">
          <div className="avatar">
            {user?.name?.slice(0, 1)?.toUpperCase() || "F"}
          </div>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <nav>
          {nav.map(([to, label]) => (
            <Link className={active === label ? "active" : ""} key={to} to={to}>
              {label}
              <ArrowRight size={14} />
            </Link>
          ))}
          <button onClick={logout}>
            <LogOut size={15} /> Sign out
          </button>
        </nav>
      </aside>
      <section className="account-content">{children}</section>
    </div>
  );
}
