import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth";
import { Notice } from "../../components/Feedback";
import { getError, responseData } from "../../utils/format";

export function AuthPage({ mode = "login", admin = false }) {
  const { login, establishSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [resetRequested, setResetRequested] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: location.state?.email || "",
    password: "",
    phone: "",
    otp: location.state?.otp || "",
    newPassword: "",
    currentPassword: "",
  });
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
    setNotice("");
    try {
      if (mode === "register") {
        const res = await authService.register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        });
        const regData = responseData(res);
        navigate("/verify-otp", {
          state: {
            email: regData?.email || form.email,
            otp: regData?.otp || "",
          },
        });
        return;
      }
      if (mode === "login") {
        const user = await login({
          email: form.email,
          password: form.password,
        });
        if (admin && user.role !== "admin") {
          setNotice("This account does not have administrator access.");
          return;
        }
        if (!admin && user.role === "admin") {
          navigate("/admin");
          return;
        }
        navigate(location.state?.from?.pathname || "/profile", {
          replace: true,
        });
        return;
      }
      if (mode === "verify") {
        const res = await authService.verifyOtp({
          email: form.email,
          otp: form.otp,
        });
        const data = responseData(res);
        if (data?.token) {
          establishSession(data);
          navigate("/");
        } else {
          setNotice("Email verified. You can now sign in.");
        }
        return;
      }
      if (mode === "forgot") {
        const res = await authService.forgotPassword({ email: form.email });
        setNotice(
          res.message ||
            "If an account exists with this email, an OTP has been sent.",
        );
        setResetRequested(true);
        return;
      }
      if (mode === "reset") {
        const res = await authService.resetPassword({
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        });
        setNotice(res.message || "Password reset. You can now sign in.");
        return;
      }
      if (mode === "change") {
        const res = await authService.changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
        setNotice(res.message || "Password updated successfully.");
        return;
      }
    } catch (error) {
      setNotice(getError(error));
      if (mode === "register" && error.status === 502)
        setVerificationPending(true);
    } finally {
      setBusy(false);
    }
  };
  const headings = {
    login: ["Welcome back.", "Sign in to your account."],
    register: ["Make room for better.", "Create your Forma account."],
    verify: ["One last thing.", "Verify your email address."],
    forgot: [
      "A fresh start.",
      "We’ll send a reset code if the account exists.",
    ],
    reset: ["Set a new password.", "Enter the one-time code from your email."],
    change: ["Keep it secure.", "Change your account password."],
  };
  const [title, subtitle] = headings[mode] || headings.login;
  return (
    <div className="auth-layout">
      <div className="auth-aside">
        <Link className="wordmark" to="/">
          FORMA<span>.</span>
        </Link>
        <div>
          <span className="eyebrow">A MORE CONSIDERED EVERYDAY</span>
          <p>“The best things become part of the rhythm of your life.”</p>
          <span>THE FORMA EDIT</span>
        </div>
        <span className="auth-aside-index">F — 01</span>
      </div>
      <div className="auth-main">
        <div className="auth-box">
          <Link className="back-link" to={admin ? "/admin/login" : "/"}>
            <ArrowLeft size={15} /> {admin ? "Back to store" : "Back to shop"}
          </Link>
          <span className="eyebrow">
            {admin ? "FORMA / ADMINISTRATION" : "YOUR FORMA ACCOUNT"}
          </span>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          <Notice>{notice}</Notice>
          <form onSubmit={submit} className="form-stack">
            {mode === "register" && (
              <label className="field-label">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={update("name")}
                  autoComplete="name"
                />
              </label>
            )}
            {["login", "register", "verify", "forgot", "reset"].includes(
              mode,
            ) && (
              <label className="field-label">
                Email address
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  autoComplete="email"
                />
              </label>
            )}
            {mode === "register" && (
              <label className="field-label">
                Phone number
                <input
                  required
                  value={form.phone}
                  onChange={update("phone")}
                  autoComplete="tel"
                />
              </label>
            )}
            {["login", "register"].includes(mode) && (
              <label className="field-label">
                Password
                <input
                  required
                  type="password"
                  minLength="8"
                  value={form.password}
                  onChange={update("password")}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </label>
            )}
            {mode === "verify" && (
              <>
                <label className="field-label">
                  Verification code
                  <input
                    required
                    inputMode="numeric"
                    value={form.otp}
                    onChange={update("otp")}
                  />
                </label>
                <button
                  type="button"
                  className="text-link"
                  onClick={async () => {
                    try {
                      const res = await authService.resendOtp({ email: form.email });
                      const resData = responseData(res);
                      if (resData?.otp) {
                        setForm((prev) => ({ ...prev, otp: resData.otp }));
                      }
                      setNotice("A new verification code has been sent.");
                    } catch (error) {
                      setNotice(getError(error));
                    }
                  }}
                >
                  Resend code
                </button>
              </>
            )}
            {mode === "reset" && (
              <>
                <label className="field-label">
                  One-time code
                  <input
                    required
                    inputMode="numeric"
                    value={form.otp}
                    onChange={update("otp")}
                  />
                </label>
                <label className="field-label">
                  New password
                  <input
                    required
                    type="password"
                    minLength="8"
                    value={form.newPassword}
                    onChange={update("newPassword")}
                  />
                </label>
              </>
            )}
            {mode === "change" && (
              <>
                <label className="field-label">
                  Current password
                  <input
                    required
                    type="password"
                    value={form.currentPassword}
                    onChange={update("currentPassword")}
                  />
                </label>
                <label className="field-label">
                  New password
                  <input
                    required
                    type="password"
                    minLength="8"
                    value={form.newPassword}
                    onChange={update("newPassword")}
                  />
                </label>
              </>
            )}
            <button disabled={busy} className="button dark full">
              {busy
                ? "Please wait…"
                : mode === "register"
                  ? "Create account"
                  : mode === "verify"
                    ? "Verify email"
                    : mode === "forgot"
                      ? "Request reset code"
                      : mode === "reset"
                        ? "Reset password"
                        : mode === "change"
                          ? "Update password"
                          : admin
                            ? "Sign in to admin"
                            : "Sign in"}{" "}
              <ArrowRight size={15} />
            </button>
          </form>
          <div className="auth-links">
            {mode === "login" && (
              <>
                <Link to="/forgot-password">Forgot password?</Link>
                {!admin && (
                  <span>
                    New to Forma? <Link to="/register">Create an account</Link>
                  </span>
                )}
              </>
            )}
            {mode === "register" && (
              <>
                {verificationPending && (
                  <Link to="/verify-otp" state={{ email: form.email }}>
                    Continue to email verification
                  </Link>
                )}
                <span>
                  Already have an account? <Link to="/login">Sign in</Link>
                </span>
              </>
            )}
            {mode === "forgot" && (
              <>
                {resetRequested && (
                  <Link to="/reset-password" state={{ email: form.email }}>
                    Enter OTP and reset password
                  </Link>
                )}
                <Link to="/login">Return to sign in</Link>
              </>
            )}
            {mode === "reset" && <Link to="/login">Return to sign in</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerifyPage() {
  return <AuthPage mode="verify" />;
}
