import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Search } from "lucide-react";
import { adminProductsService } from "../../services/adminProducts";
import { adminCategoriesService } from "../../services/adminCategories";
import { AdminLayout } from "../../layouts/AdminLayout";
import { Busy, Empty, Notice } from "../../components/Feedback";
import {
  getError,
  idOf,
  imageUrl,
  money,
  responseData,
} from "../../utils/format";

export function AdminProducts() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const load = () => {
    setLoading(true);
    adminProductsService
      .list({
        page,
        limit: 10,
        ...(search ? { search } : {}),
        ...(active ? { isActive: active } : {}),
      })
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
  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await adminProductsService.remove(id);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };
  return (
    <AdminLayout title="Products">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">CATALOG / INVENTORY</span>
          <h1>Products</h1>
          <p>Keep your collection considered and current.</p>
        </div>
        <Link className="button dark" to="/admin/products/new">
          Add product <ArrowRight size={15} />
        </Link>
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
            placeholder="Search products"
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
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      {error && <Notice>{error}</Notice>}
      {loading ? (
        <Busy />
      ) : (
        <div className="table-wrap admin-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="table-product">
                      <span>
                        {product.images?.[0] && (
                          <img src={imageUrl(product.images[0])} alt="" />
                        )}
                      </span>
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.sku || product.slug}</small>
                      </div>
                    </div>
                  </td>
                  <td>{product.category?.name || "—"}</td>
                  <td>{money(product.effectivePrice ?? product.price)}</td>
                  <td>
                    <span className={product.stock <= 5 ? "stock-low" : ""}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${product.isActive ? "green" : "cancelled"}`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="table-link"
                      to={`/admin/products/${product._id}/edit`}
                    >
                      Edit <ArrowRight size={13} />
                    </Link>
                    <button
                      className="table-delete"
                      onClick={() => remove(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && (
            <Empty
              title="No products found"
              copy="Try adjusting your search or add a product."
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

export function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [unavailableImages, setUnavailableImages] = useState(() => new Set());
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "0",
    stock: "",
    category: "",
    sku: "",
    isFeatured: false,
    isActive: true,
  });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  useEffect(() => {
    adminCategoriesService
      .list()
      .then((res) => setCategories(responseData(res) || []))
      .catch((err) => setError(getError(err)));
    if (id) {
      setLoading(true);
      adminProductsService
        .get(id)
        .then((res) => {
          const product = responseData(res);
          setExistingImages(product.images || []);
          setForm({
            name: product.name,
            description: product.description,
            price: product.price,
            discountPrice: product.discountPrice || 0,
            stock: product.stock,
            category: idOf(product.category),
            sku: product.sku || "",
            isFeatured: product.isFeatured,
            isActive: product.isActive,
          });
        })
        .catch((err) => setError(getError(err)))
        .finally(() => setLoading(false));
    }
  }, [id]);
  const change = (key) => (event) =>
    setForm({
      ...form,
      [key]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    files.forEach((file) => body.append("images", file));
    if (id) {
      const imagesToKeep =
        files.length > 0
          ? existingImages.filter((image) => !unavailableImages.has(image))
          : existingImages;
      body.append("existingImages", JSON.stringify(imagesToKeep));
    }
    try {
      if (id) await adminProductsService.update(id, body);
      else await adminProductsService.create(body);
      navigate("/admin/products");
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };
  if (loading) {
    return (
      <AdminLayout title="Edit product">
        <Busy label="Loading product details..." />
      </AdminLayout>
    );
  }
  return (
    <AdminLayout title={id ? "Edit product" : "Add product"}>
      <Link className="back-link" to="/admin/products">
        <ArrowLeft size={15} /> Products
      </Link>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">CATALOG / PRODUCT</span>
          <h1>{id ? "Edit product" : "Add a product"}</h1>
          <p>Give this piece a proper place in the collection.</p>
        </div>
      </div>
      <Notice>{error}</Notice>
      <form className="admin-form admin-panel" onSubmit={submit}>
        <div className="form-grid">
          <label className="field-label span-two">
            Product name
            <input required value={form.name} onChange={change("name")} />
          </label>
          <label className="field-label span-two">
            Description
            <textarea
              required
              rows="5"
              value={form.description}
              onChange={change("description")}
            />
          </label>
          <label className="field-label">
            Price
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={change("price")}
            />
          </label>
          <label className="field-label">
            Discount price
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.discountPrice}
              onChange={change("discountPrice")}
            />
          </label>
          <label className="field-label">
            Stock
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={change("stock")}
            />
          </label>
          <label className="field-label">
            SKU
            <input value={form.sku} onChange={change("sku")} />
          </label>
          <label className="field-label span-two">
            Category
            <select
              required
              value={form.category}
              onChange={change("category")}
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="span-two">
            <label className="field-label">
              Product images{" "}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  const selected = [...e.target.files].slice(0, 5);
                  setFiles(selected);
                  setPreview(selected.map((file) => URL.createObjectURL(file)));
                }}
              />
            </label>
            <div className="preview-row">
              {existingImages.map((src) => (
                <div className="image-preview" key={src}>
                  {unavailableImages.has(src) ? (
                    <span className="image-placeholder">
                      Image unavailable. Upload a replacement.
                    </span>
                  ) : (
                    <img
                      src={imageUrl(src)}
                      alt="Current product"
                      onError={() =>
                        setUnavailableImages((current) =>
                          new Set(current).add(src),
                        )
                      }
                    />
                  )}
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      setExistingImages((current) =>
                        current.filter((image) => image !== src),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              {preview.map((src) => (
                <img src={src} alt="Selected product preview" key={src} />
              ))}
            </div>
            {id && (
              <p className="field-hint">
                Upload new images to replace unavailable ones, or remove images before saving.
              </p>
            )}
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={Boolean(form.isFeatured)}
              onChange={change("isFeatured")}
            />{" "}
            Featured
          </label>
          {id && (
            <label className="check-label">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={change("isActive")}
              />{" "}
              Active
            </label>
          )}
        </div>
        <div className="form-footer">
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>
          <button className="button dark" disabled={busy}>
            {busy ? "Saving…" : "Save product"} <Check size={15} />
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
