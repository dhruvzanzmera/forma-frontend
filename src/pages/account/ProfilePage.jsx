import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, MapPin, Package, ShieldCheck } from "lucide-react";
import { usersService } from "../../services/users";
import { AccountLayout } from "../../layouts/AccountLayout";
import { Busy, Notice } from "../../components/Feedback";
import { useNotice } from "../../hooks/useNotice";
import { getError, responseData } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, show] = useNotice();
  useEffect(() => {
    usersService
      .profile()
      .then((res) => {
        const data = responseData(res);
        setProfile({ name: data.name || "", phone: data.phone || "" });
        setUser(data);
        localStorage.setItem("atelier_current_user", JSON.stringify(data));
      })
      .catch((err) => show(getError(err)))
      .finally(() => setLoading(false));
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await usersService.updateProfile(profile);
      setUser(responseData(res));
      localStorage.setItem(
        "atelier_current_user",
        JSON.stringify(responseData(res)),
      );
      show("Your profile has been updated.");
    } catch (error) {
      show(getError(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AccountLayout active="Overview">
      <span className="eyebrow">ACCOUNT / PROFILE</span>
      <h1>Good to see you, {profile.name.split(" ")[0] || "there"}.</h1>
      <p className="page-lede">
        Manage your details and make yourself at home.
      </p>
      <Notice type="success">{notice}</Notice>
      {loading ? (
        <Busy />
      ) : (
        <>
          <div className="account-shortcuts">
            <Link className="account-shortcut" to="/orders">
              <span className="shortcut-icon">
                <Package size={18} />
              </span>
              <span>
                <strong>Your orders</strong>
                <small>Follow every delivery</small>
              </span>
              <ArrowRight size={15} />
            </Link>
            <Link className="account-shortcut" to="/addresses">
              <span className="shortcut-icon">
                <MapPin size={18} />
              </span>
              <span>
                <strong>Delivery addresses</strong>
                <small>Keep your destinations close</small>
              </span>
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="profile-security-note">
            <ShieldCheck size={18} />
            <span>
              <strong>
                {user?.isEmailVerified ? "Email verified" : "Verify your email"}
              </strong>
              <small>
                {user?.isEmailVerified
                  ? user.email
                  : "Your email is used for order updates and account recovery."}
              </small>
            </span>
            <Link to="/change-password">
              Security <ArrowRight size={13} />
            </Link>
          </div>
          <form className="profile-form" onSubmit={submit}>
            <div className="section-heading profile-form-heading">
              <div>
                <span className="eyebrow">PERSONAL DETAILS</span>
                <h2>Make it yours.</h2>
              </div>
            </div>
            <label className="field-label">
              Full name
              <input
                required
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </label>
            <label className="field-label">
              Email address
              <input disabled value={user?.email || ""} />
            </label>
            <label className="field-label">
              Phone number
              <input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </label>
            <button className="button dark" disabled={busy}>
              {busy ? "Saving…" : "Save changes"} <Check size={15} />
            </button>
          </form>
        </>
      )}
    </AccountLayout>
  );
}
