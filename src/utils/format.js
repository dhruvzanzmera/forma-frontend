export const imageUrl = (path) =>
  path?.startsWith("http")
    ? path
    : path
      ? `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "")}${path}`
      : "";

export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const idOf = (value) => (typeof value === "object" ? value?._id : value);
export const responseData = (response) => response?.data;
export const getError = (error) =>
  error?.message || "Something went wrong. Please try again.";
export const USER_KEY = "atelier_current_user";
