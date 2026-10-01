import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { cartService } from "../../services/cart";
import { productsService } from "../../services/products";
import { ProductCard } from "../../components/ProductCard";
import { Busy, ErrorState, Notice } from "../../components/Feedback";
import { useNotice } from "../../hooks/useNotice";
import {
  getError,
  idOf,
  imageUrl,
  money,
  responseData,
} from "../../utils/format";

export function ProductDetails({ refreshCart }) {
  const { idOrSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [notice, show] = useNotice();
  useEffect(() => {
    setLoading(true);
    productsService
      .get(idOrSlug)
      .then((res) => {
        setProduct(responseData(res));
        setSelectedImage(0);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [idOrSlug]);
  const categoryId = idOf(product?.category);
  useEffect(() => {
    if (!categoryId || !product?._id) return undefined;
    let active = true;
    productsService
      .list({ category: categoryId, sort: "newest", page: 1, limit: 5 })
      .then((res) => {
        if (active) {
          setRelatedProducts(
            (responseData(res) || [])
              .filter((item) => item._id !== product._id)
              .slice(0, 4),
          );
        }
      })
      .catch(() => {
        if (active) setRelatedProducts([]);
      });
    return () => {
      active = false;
    };
  }, [categoryId, product?._id]);
  const images = product?.images || [];
  const add = async () => {
    try {
      await cartService.add({ productId: product._id, quantity });
      await refreshCart();
      show("Added to your bag.", "success");
    } catch (err) {
      show(getError(err));
    }
  };
  if (loading)
    return (
      <div className="page-wrap">
        <Busy label="Opening product" />
      </div>
    );
  if (error || !product)
    return (
      <div className="page-wrap">
        <ErrorState error={error || "Product not found."} />
      </div>
    );
  return (
    <div className="detail-page page-wrap">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="detail-grid">
        <div className="gallery">
          <div className="gallery-main">
            {images.length ? (
              <img
                src={imageUrl(images[selectedImage] || images[0])}
                alt={`${product.name} view ${selectedImage + 1}`}
              />
            ) : (
              <div className="image-placeholder">
                <Package size={44} />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbnails" aria-label="Product images">
              {images.map((image, index) => (
                <button
                  className={selectedImage === index ? "selected" : ""}
                  key={image}
                  type="button"
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={imageUrl(image)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          <span className="eyebrow">
            {product.category?.name || "FORMA OBJECTS"}
          </span>
          <h1>{product.name}</h1>
          <div className="detail-price">
            {money(
              product.effectivePrice ?? product.discountPrice ?? product.price,
            )}
            {product.discountPrice > 0 &&
              product.discountPrice < product.price && (
                <del>{money(product.price)}</del>
              )}
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="stock-note">
            <span
              className={product.stock > 0 ? "stock-dot" : "stock-dot out"}
            />
            {product.stock > 0
              ? `In stock · ${product.stock} available`
              : "Currently unavailable"}
          </div>
          <div className="buy-row">
            <div className="stepper">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(
                    Math.min(Number(product.stock || 1), quantity + 1),
                  )
                }
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              className="button dark"
              disabled={!product.stock}
              onClick={add}
            >
              Add to bag <ShoppingBag size={16} />
            </button>
          </div>
          <Notice type="success" onClose={() => show("")}>
            {notice}
          </Notice>
          <div className="detail-assurances">
            <p>
              <Truck size={17} /> Careful delivery, tracked to your door
            </p>
            <p>
              <ShieldCheck size={17} /> Secure, encrypted checkout
            </p>
          </div>
          <details>
            <summary>
              Product details <ChevronDown size={15} />
            </summary>
            <p>{product.description}</p>
          </details>
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <section className="section-block related-products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SAME COLLECTION</span>
              <h2>
                Made to go <em>together.</em>
              </h2>
            </div>
            <Link
              className="text-link"
              to={`/categories/${product.category?.slug}`}
            >
              Shop the collection <ArrowRight size={15} />
            </Link>
          </div>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
