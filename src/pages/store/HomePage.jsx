import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { cartService } from "../../services/cart";
import { productsService } from "../../services/products";
import { Busy, Empty, ErrorState } from "../../components/Feedback";
import { ProductCard } from "../../components/ProductCard";
import { getError, imageUrl, responseData } from "../../utils/format";

export function Home({ categories = [], refreshCart }) {
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [error, setError] = useState("");
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  useEffect(() => {
    productsService
      .featured(8)
      .then((res) => setProducts(responseData(res) || []))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoadingFeatured(false));
    productsService
      .list({ sort: "newest", page: 1, limit: 4 })
      .then((res) => setNewArrivals(responseData(res) || []))
      .catch(() => setNewArrivals([]));
  }, []);
  const add = async (product) => {
    try {
      await cartService.add({ productId: product._id, quantity: 1 });
      await refreshCart();
    } catch {
      window.location.href = "/login";
    }
  };
  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">THE EVERYDAY EDIT · VOL. 04</span>
          <h1>
            Less, but
            <br />
            <em>better.</em>
          </h1>
          <p>
            Objects that bring a little more intention to the everyday.
            Thoughtfully chosen, made to be lived with.
          </p>
          <Link className="button light" to="/products">
            Explore the collection <ArrowUpRight size={16} />
          </Link>
          <div className="hero-note">
            <span>01 / 04</span>
            <span>Made for the long run</span>
          </div>
        </div>
        <div className="hero-art">
          <img
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1500&q=85"
            alt="Warm minimal interior with considered furnishings"
          />
          <div className="art-caption">
            <span>FORM / FUNCTION</span>
            <span>Objects for living</span>
          </div>
        </div>
        <div className="hero-index">
          F<span>—</span>01
        </div>
      </section>
      <section className="intro-strip">
        <span className="eyebrow">A MORE CONSIDERED HOME</span>
        <p>
          Good design doesn't ask for attention.
          <br />
          <em>It earns a place in your life.</em>
        </p>
        <Link to="/products">
          Our point of view <ArrowRight size={14} />
        </Link>
      </section>
      {categories.length > 0 && (
        <section className="section-block category-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR FORM</span>
              <h2>
                Shop by <em>collection.</em>
              </h2>
            </div>
            <Link className="text-link" to="/products">
              Explore every piece <ArrowRight size={15} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                className={`category-tile category-tile-${index + 1}`}
                key={category._id}
                to={`/categories/${category.slug}`}
              >
                {category.image ? (
                  <img
                    src={imageUrl(category.image)}
                    alt={category.name}
                    loading="lazy"
                  />
                ) : (
                  <span className="category-initial" aria-hidden="true">
                    {category.name?.slice(0, 1)}
                  </span>
                )}
                <span className="category-tile-shade" />
                <span className="category-tile-copy">
                  <span>{category.description || "The considered edit"}</span>
                  <strong>{category.name}</strong>
                  <span className="category-tile-link">
                    Explore <ArrowUpRight size={15} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {newArrivals.length > 0 && (
        <section className="section-block arrivals-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">JUST ARRIVED</span>
              <h2>
                New to the <em>everyday.</em>
              </h2>
            </div>
            <Link className="text-link" to="/products?sort=newest">
              See what's new <ArrowRight size={15} />
            </Link>
          </div>
          <div className="product-grid">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} onAdd={add} />
            ))}
          </div>
        </section>
      )}
      <section className="section-block collection-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A FEW GOOD THINGS</span>
            <h2>
              Selected for <em>every day.</em>
            </h2>
          </div>
          <Link className="text-link" to="/products">
            View all products <ArrowRight size={15} />
          </Link>
        </div>
        {error ? (
          <ErrorState
            error={error}
            retry={() =>
              productsService
                .featured(8)
                .then((res) => setProducts(responseData(res) || []))
                .catch((err) => setError(getError(err)))
            }
          />
        ) : loadingFeatured ? (
          <Busy label="Curating the collection" />
        ) : products.length ? (
          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} onAdd={add} />
            ))}
          </div>
        ) : (
          <Empty
            title="A quieter kind of collection"
            copy="Featured products will appear here as soon as they're available."
            action={
              <Link className="button secondary" to="/products">
                Browse all products
              </Link>
            }
          />
        )}
      </section>
      <section className="service-band">
        <div>
          <Sparkles />
          <span>Made to be kept</span>
        </div>
        <div>
          <Truck />
          <span>Careful delivery</span>
        </div>
        <div>
          <ShieldCheck />
          <span>Secure checkout</span>
        </div>
      </section>
    </>
  );
}
