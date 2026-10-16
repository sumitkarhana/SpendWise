export const CATEGORIES = {
  expense: ["Food", "Education", "Transport", "Shopping", "Entertainment", "Health", "Other"],
  income: ["Salary", "Stipend", "Freelance", "Gift", "Other"],
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
export const formatINR = (n) => inr.format(n || 0);

// Dates are stored as UTC midnight, so always read them in UTC
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
export const toInputDate = (iso) => String(iso).slice(0, 10);
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const monthLabel = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", { timeZone: "UTC", month: "short", year: "2-digit" });
};
