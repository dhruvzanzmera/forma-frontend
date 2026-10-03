import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleUserRound,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { categoriesService } from "../services/categories";
import { responseData } from "../utils/format";

export function Header({ categories = [], cartCount = 0 }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const submit = (event) => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };
  return (
    <>
      <div className="announcement">
        <span>Considered goods. Delivered with care.</span>
        <span>Cash on delivery available</span>
      </div>
      <header className="site-header">
        <button
          className="icon-button mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <Link className="wordmark" to="/">
          FORMA<span>.</span>
        </Link>
        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
          <Link to="/products">Shop all</Link>
          {categories.slice(0, 4).map((category) => (
            <Link key={category._id} to={`/categories/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </nav>
        <form className="header-search" onSubmit={submit}>
          <Search size={16} />
          <input
            aria-label="Search products"
            placeholder="Search the collection"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button aria-label="Submit search">
            <ArrowRight size={15} />
          </button>
        </form>
        <div className="header-actions">
          <Link
            className="icon-button account-link"
            to={user ? "/profile" : "/login"}
            aria-label="Account"
          >
            <CircleUserRound />
          </Link>
          <Link
            className="bag-link"
            to="/cart"
            aria-label={`Shopping bag, ${cartCount} items`}
          >
            <ShoppingBag />
            <span>{cartCount}</span>
          </Link>
        </div>
      </header>
      <div className="category-rail">
        <Link to="/products?featured=true">
          New &amp; notable <Sparkles size={13} />
        </Link>
        {categories.slice(0, 6).map((category) => (
          <Link key={category._id} to={`/categories/${category.slug}`}>
            {category.name}
          </Link>
        ))}
        <span className="rail-end">Objects for everyday living</span>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <Link className="wordmark" to="/">
        FORMA<span>.</span>
      </Link>
      <span>Thoughtful design, made to stay.</span>
      <span>© 2026 Forma Supply Co.</span>
    </footer>
  );
}

export function StoreLayout({ children }) {
  const [categories, setCategories] = useState([]);
  // Cart count comes from the global CartContext — no local fetching needed.
  const { cartCount } = useCart();

  useEffect(() => {
    categoriesService
      .list()
      .then((res) => setCategories(responseData(res) || []))
      .catch(() => {});
  }, []);

  return (
    <div className="store-shell">
      <Header categories={categories} cartCount={cartCount} />
      <main className="store-main">{children}</main>
      <Footer />
    </div>
  );
}
