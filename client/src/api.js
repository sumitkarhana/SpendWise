const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-Requested-With": "SpendWise" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong");
    err.status = res.status;
    throw err;
  }
  return data;
}

const qs = (params = {}) => {
  const p = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const api = {
  register: (b) => request("/auth/register", { method: "POST", body: b }),
  login: (b) => request("/auth/login", { method: "POST", body: b }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  listTransactions: (f) => request("/transactions" + qs(f)),
  createTransaction: (b) => request("/transactions", { method: "POST", body: b }),
  updateTransaction: (id, b) => request(`/transactions/${id}`, { method: "PUT", body: b }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: "DELETE" }),
  summary: (f) => request("/transactions/summary" + qs(f)),
  analytics: (f) => request("/transactions/analytics" + qs(f)),
  listBudgets: (f) => request("/budgets" + qs(f)),
  createBudget: (b) => request("/budgets", { method: "POST", body: b }),
  updateBudget: (id, b) => request(`/budgets/${id}`, { method: "PUT", body: b }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: "DELETE" }),
};
