import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";
import { imageUrl, money } from "../utils/format";

export function ProductCard({ product, onAdd }) {
  const image = product.images?.[0];
  return (
    <article className="product-card">
      <Link
        to={`/products/${product.slug || product._id}`}
        className="product-image"
      >
        {image ? (
          <img src={imageUrl(image)} alt={product.name} loading="lazy" />
        ) : (
          <div className="image-placeholder">
            <Package size={28} />
          </div>
        )}
        {product.isFeatured && <span className="product-tag">Selected</span>}
      </Link>
      <div className="product-meta">
        <div>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="product-name"
          >
            {product.name}
          </Link>
          <span>{product.category?.name || "Forma collection"}</span>
        </div>
        <div className="product-price">
          {money(
            product.effectivePrice ?? product.discountPrice ?? product.price,
          )}
          {product.discountPrice > 0 &&
            product.discountPrice < product.price && (
              <del>{money(product.price)}</del>
            )}
        </div>
      </div>
      {onAdd && (
        <button
          className="quick-add"
          disabled={!product.stock}
          onClick={() => onAdd(product)}
        >
          {product.stock ? "Add to bag" : "Currently unavailable"}
          {Boolean(product.stock) && <ArrowRight size={14} />}
        </button>
      )}
    </article>
  );
}
