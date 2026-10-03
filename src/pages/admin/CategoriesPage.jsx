import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { adminCategoriesService } from "../../services/adminCategories";
import { AdminLayout } from "../../layouts/AdminLayout";
import { Busy, Notice } from "../../components/Feedback";
import { getError, responseData } from "../../utils/format";

export function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    adminCategoriesService
      .list()
      .then((res) => setItems(responseData(res) || []))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing) await adminCategoriesService.update(editing, form);
      else await adminCategoriesService.create(form);
      setEditing(null);
      setForm({ name: "", description: "", image: "", isActive: true });
      load();
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await adminCategoriesService.remove(id);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };
  return (
    <AdminLayout title="Categories">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">CATALOG / COLLECTIONS</span>
          <h1>Categories</h1>
          <p>Organize the pieces in your collection.</p>
        </div>
      </div>
      <Notice>{error}</Notice>
      <div className="category-admin-layout">
        <form className="admin-panel admin-form" onSubmit={submit}>
          <span className="eyebrow">
            {editing ? "EDIT CATEGORY" : "NEW CATEGORY"}
          </span>
          <h2>{editing ? "Update this collection" : "Create a collection"}</h2>
          <label className="field-label">
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="field-label">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label className="field-label">
            Image URL
            <input
              value={form.image || ""}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />{" "}
            Active
          </label>
          <button className="button dark full" disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create category"}{" "}
            <ArrowRight size={15} />
          </button>
        </form>
        <div className="category-list">
          {loading ? (
            <Busy label="Loading collections..." />
          ) : items.length ? (
            items.map((category) => (
              <article className="category-row" key={category._id}>
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.description || category.slug}</span>
                </div>
                <span
                  className={`status-pill ${category.isActive ? "green" : "cancelled"}`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => {
                    setEditing(category._id);
                    setForm({
                      name: category.name,
                      description: category.description || "",
                      image: category.image || "",
                      isActive: category.isActive,
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="table-delete"
                  onClick={() => remove(category._id)}
                >
                  Delete
                </button>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <p>No collections found. Create your first category above.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>

  );
}
