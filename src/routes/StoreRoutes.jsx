import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { categoriesService } from "../services/categories";
import { cartService } from "../services/cart";
import { Home } from "../pages/store/HomePage";
import { ProductsPage } from "../pages/store/ProductsPage";
import { ProductDetails } from "../pages/store/ProductDetailsPage";
import { Footer, Header, StoreLayout } from "../layouts/StoreLayout";
import { CartPage } from "../pages/account/CartPage";
import { Busy, ErrorState } from "../components/Feedback";
import { getError, responseData } from "../utils/format";
import { notifyCartChanged } from "../utils/cartEvents";

export function StoreRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  return <StorePage location={location} isAuthenticated={isAuthenticated} />;
}

export function StorePage({ location, isAuthenticated }) {
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  useEffect(() => {
    categoriesService
      .list()
      .then((res) => setCategories(responseData(res) || []))
      .catch(() => {});
  }, []);
  const refreshCart = () =>
    isAuthenticated
      ? cartService
          .get()
          .then((res) => {
            setCart(responseData(res));
            notifyCartChanged();
          })
          .catch(() => {})
      : Promise.resolve();
  useEffect(() => {
    if (isAuthenticated) refreshCart();
    else setCart(null);
  }, [isAuthenticated]);
  const count =
    cart?.itemsCount ??
    cart?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ??
    0;
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
      <Header categories={categories} cartCount={count} />
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
  const refreshCart = () => {
    notifyCartChanged();
    return Promise.resolve();
  };
  return (
    <StoreLayout>
      <CartPage refreshCart={refreshCart} />
    </StoreLayout>
  );
}
