import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { categoriesService } from "../services/categories";
import { Home } from "../pages/store/HomePage";
import { ProductsPage } from "../pages/store/ProductsPage";
import { ProductDetails } from "../pages/store/ProductDetailsPage";
import { Footer, Header, StoreLayout } from "../layouts/StoreLayout";
import { CartPage } from "../pages/account/CartPage";
import { Busy, ErrorState } from "../components/Feedback";
import { getError, responseData } from "../utils/format";

export function StoreRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  return <StorePage location={location} isAuthenticated={isAuthenticated} />;
}

export function StorePage({ location, isAuthenticated }) {
  const [categories, setCategories] = useState([]);
  // Cart count and refresh come from the global CartContext.
  const { cartCount, refreshCart } = useCart();

  useEffect(() => {
    categoriesService
      .list()
      .then((res) => setCategories(responseData(res) || []))
      .catch(() => {});
  }, []);

  let page;
  if (location.pathname === "/")
    page = <Home categories={categories} refreshCart={refreshCart} />;
  else if (location.pathname.startsWith("/categories/"))
    page = <CategoryProducts refreshCart={refreshCart} />;
  else if (location.pathname === "/products" || location.pathname === "/search")
    page = <ProductsPage refreshCart={refreshCart} />;
  else page = <ProductDetails refreshCart={refreshCart} />;

  return (
    <div className="store-shell">
      <Header categories={categories} cartCount={cartCount} />
      <main className="store-main">{page}</main>
      <Footer />
    </div>
  );
}

export function CategoryProducts({ refreshCart }) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    categoriesService
      .get(slug)
      .then((res) => {
        const category = responseData(res);
        if (active && category?._id)
          setSearchParams({ category: category._id }, { replace: true });
        else if (active) setError("This collection is not available.");
      })
      .catch((err) => {
        if (active) setError(getError(err));
      });
    return () => {
      active = false;
    };
  }, [slug]);
  if (error)
    return (
      <div className="page-wrap">
        <ErrorState error={error} />
      </div>
    );
  return searchParams.has("category") ? (
    <ProductsPage refreshCart={refreshCart} />
  ) : (
    <div className="page-wrap">
      <Busy label="Opening collection" />
    </div>
  );
}

export function CartRoute() {
  const { refreshCart } = useCart();
  return (
    <StoreLayout>
      <CartPage refreshCart={refreshCart} />
    </StoreLayout>
  );
}
