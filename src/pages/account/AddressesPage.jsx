import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { addressesService } from "../../services/addresses";
import { AccountLayout } from "../../layouts/AccountLayout";
import { Busy, Empty, Notice } from "../../components/Feedback";
import { useNotice } from "../../hooks/useNotice";
import { getError, responseData } from "../../utils/format";

export function AddressesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, show] = useNotice();
  const load = () =>
    addressesService
      .list()
      .then((res) => setItems(responseData(res) || []))
      .catch((err) => show(getError(err)))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const remove = async (id) => {
    if (!window.confirm("Remove this saved address?")) return;
    try {
      await addressesService.remove(id);
      await load();
    } catch (err) {
      show(getError(err));
    }
  };
  return (
    <AccountLayout active="Addresses">
      <div className="content-heading">
        <div>
          <span className="eyebrow">ACCOUNT / DELIVERY</span>
          <h1>Saved addresses</h1>
        </div>
        <Link className="button dark" to="/addresses/new">
          Add address <ArrowRight size={15} />
        </Link>
      </div>
      <Notice type="success">{notice}</Notice>
      {loading ? (
        <Busy />
      ) : items.length ? (
        <div className="address-grid">
          {items.map((address) => (
            <article className="address-card" key={address._id}>
              <div className="address-card-head">
                <strong>{address.fullName}</strong>
                {address.isDefault && (
                  <span className="status-pill green">Default</span>
                )}
              </div>
              <p>
                {address.street}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
                <br />
                {address.phone}
              </p>
              <div className="address-actions">
                <Link to={`/addresses/${address._id}/edit`}>Edit</Link>
                {!address.isDefault && (
                  <button
                    onClick={async () => {
                      try {
                        await addressesService.setDefault(address._id);
                        await load();
                      } catch (err) {
                        show(getError(err));
                      }
                    }}
                  >
                    Set as default
                  </button>
                )}
                <button onClick={() => remove(address._id)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="No saved addresses"
          copy="Add a delivery address to make your next checkout easier."
          action={
            <Link className="button dark" to="/addresses/new">
              Add an address
            </Link>
          }
        />
      )}
    </AccountLayout>
  );
}

export function AddressFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (id)
      addressesService
        .get(id)
        .then((res) =>
          setForm((current) => ({ ...current, ...responseData(res) })),
        )
        .catch((err) => setNotice(getError(err)));
  }, [id]);
  const update = (key) => (event) =>
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
    try {
      if (id) await addressesService.update(id, form);
      else await addressesService.create(form);
      navigate("/addresses");
    } catch (error) {
      setNotice(getError(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AccountLayout active="Addresses">
      <Link className="back-link" to="/addresses">
        <ArrowLeft size={15} /> Saved addresses
      </Link>
      <span className="eyebrow">ACCOUNT / DELIVERY</span>
      <h1>{id ? "Edit address" : "Add an address"}</h1>
      <Notice>{notice}</Notice>
      <form className="address-form form-grid" onSubmit={submit}>
        {[
          ["fullName", "Full name"],
          ["phone", "Phone"],
          ["street", "Street address"],
          ["city", "City"],
          ["state", "State"],
          ["postalCode", "Postal code"],
          ["country", "Country"],
        ].map(([key, label]) => (
          <label
            className={`field-label ${key === "street" ? "span-two" : ""}`}
            key={key}
          >
            {label}
            <input required value={form[key] || ""} onChange={update(key)} />
          </label>
        ))}
        <label className="check-label span-two">
          <input
            type="checkbox"
            checked={Boolean(form.isDefault)}
            onChange={update("isDefault")}
          />{" "}
          Set as default address
        </label>
        <button className="button dark span-two" disabled={busy}>
          {busy ? "Saving…" : "Save address"} <Check size={15} />
        </button>
      </form>
    </AccountLayout>
  );
}
