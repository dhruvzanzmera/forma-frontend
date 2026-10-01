import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { cartService } from "../../services/cart";
import { productsService } from "../../services/products";
import { Busy, Empty, ErrorState } from "../../components/Feedback";
import { ProductCard } from "../../components/ProductCard";
import { getError, responseData } from "../../utils/format";

export function ProductsPage({ refreshCart }) {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(params.get("search") || "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [inStock, setInStock] = useState(params.get("inStock") === "true");
  const [featured, setFeatured] = useState(params.get("featured") === "true");
  const category = params.get("category") || "";
  const page = Number(params.get("page") || 1);
  const load = (next = {}) => {
    setLoading(true);
    setError("");
    const query = {
      search: params.get("search") || undefined,
      category: params.get("category") || undefined,
      minPrice: params.get("minPrice") || undefined,
      maxPrice: params.get("maxPrice") || undefined,
      sort: params.get("sort") || "newest",
      featured: params.get("featured") || undefined,
      inStock: params.get("inStock") || undefined,
      page: params.get("page") || 1,
      limit: 12,
      ...next,
    };
    productsService
      .list(query)
      .then((res) => {
        setItems(responseData(res) || []);
        setMeta(res.meta || null);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [params]);
  const apply = (event) => {
    event.preventDefault();
    setParams({
      ...(params.get("category") ? { category: params.get("category") } : {}),
      ...(search ? { search } : {}),
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(inStock ? { inStock: "true" } : {}),
      ...(featured ? { featured: "true" } : {}),
      sort,
    });
  };
  const add = async (product) => {
    try {
      await cartService.add({ productId: product._id, quantity: 1 });
      await refreshCart();
    } catch (err) {
      setError(getError(err));
    }
  };
  return (
    <div className="catalog-page page-wrap">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>
          {category
            ? "Category"
            : params.get("search")
              ? "Search results"
              : "Shop all"}
        </span>
      </div>
      <div className="catalog-title">
        <div>
          <span className="eyebrow">THE FORMA COLLECTION</span>
          <h1>
            {params.get("search")
              ? `Results for “${params.get("search")}”`
              : category
                ? "A considered edit."
                : "Find your everyday."}
          </h1>
        </div>
        <span className="result-count">
          {meta?.total ?? items.length} pieces
        </span>
      </div>
      <div className="catalog-layout">
        <aside className="filter-panel">
          <div className="filter-title">
            <SlidersHorizontal size={16} /> Refine <span>04</span>
          </div>
          <form onSubmit={apply}>
            <label className="field-label">
              Search
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What are you looking for?"
              />
            </label>
            <label className="field-label">
              Price range
              <div className="price-fields">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </label>
            <label className="field-label">
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </label>
            <div className="filter-checks">
              <label>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(event) => setInStock(event.target.checked)}
                />
                <span>Available now</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) => setFeatured(event.target.checked)}
                />
                <span>Featured pieces</span>
              </label>
            </div>
            <button className="button dark full">
              Apply filters <ArrowRight size={15} />
            </button>
          </form>
        </aside>
        <div className="catalog-results">
          <div className="results-bar">
            <span>
              {loading
                ? "Finding your pieces…"
                : `Showing ${items.length} of ${meta?.total ?? items.length}`}
            </span>
            <button
              className="sort-mobile"
              onClick={() =>
                setParams({
                  ...Object.fromEntries(params),
                  sort: sort === "newest" ? "price_asc" : "newest",
                })
              }
            >
              Sort <ChevronDown size={14} />
            </button>
          </div>
          {error ? (
            <ErrorState error={error} retry={load} />
          ) : loading ? (
            <Busy label="Loading the collection" />
          ) : items.length ? (
            <>
              <div className="product-grid">
                {items.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAdd={add}
                  />
                ))}
              </div>
              {meta?.totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={!meta.hasPrevPage}
                    onClick={() =>
                      setParams({
                        ...Object.fromEntries(params),
                        page: String(page - 1),
                      })
                    }
                  >
                    <ArrowLeft size={15} /> Previous
                  </button>
                  <span>
                    {meta.page} / {meta.totalPages}
                  </span>
                  <button
                    disabled={!meta.hasNextPage}
                    onClick={() =>
                      setParams({
                        ...Object.fromEntries(params),
                        page: String(page + 1),
                      })
                    }
                  >
                    Next <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <Empty
              title="Nothing in this edit yet"
              copy="Try a different search or adjust your filters."
              action={
                <button
                  className="button secondary"
                  onClick={() => {
                    setSearch("");
                    setMinPrice("");
                    setMaxPrice("");
                    setInStock(false);
                    setFeatured(false);
                    setParams({});
                  }}
                >
                  Clear filters
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
