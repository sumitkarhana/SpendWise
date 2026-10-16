import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { CATEGORIES, formatINR } from "../utils";

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Budgets() {
  const [period, setPeriod] = useState(thisMonth());
  const [budgets, setBudgets] = useState(null);
  const [form, setForm] = useState({ category: "", amount: "" });
  const [editId, setEditId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [error, setError] = useState("");

  const [year, month] = period.split("-").map(Number);
  const load = useCallback(() => {
    if (!year || !month) return;
    api.listBudgets({ month, year }).then(setBudgets).catch((e) => setError(e.message));
  }, [month, year]);
  useEffect(load, [load]);

  async function add(e) {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (!form.category) return setError("Choose a category");
    if (!Number.isFinite(amount) || amount <= 0) return setError("Enter a budget greater than zero");
    try {
      await api.createBudget({ category: form.category, amount, month, year });
      setForm({ category: "", amount: "" });
      load();
    } catch (err) { setError(err.message); }
  }

  async function saveEdit(id) {
    setError("");
    const amount = Number(editAmount);
    if (!Number.isFinite(amount) || amount <= 0) return setError("Enter a budget greater than zero");
    try {
      await api.updateBudget(id, { amount });
      setEditId(null);
      load();
    } catch (err) { setError(err.message); }
  }

  async function remove(b) {
    if (!window.confirm(`Delete the ${b.category} budget?`)) return;
    try { await api.deleteBudget(b._id); load(); } catch (err) { setError(err.message); }
  }

  const available = CATEGORIES.expense.filter((c) => !budgets?.some((b) => b.category === c));

  return (
    <>
      <section className="panel form-grid">
        <h2 className="span-2">Monthly budgets</h2>
        <label>Month<input type="month" value={period} onChange={(e) => e.target.value && setPeriod(e.target.value)} /></label>
        <span />
      </section>
      <form className="panel form-grid" onSubmit={add}>
        <h2 className="span-2">Set a budget</h2>
        <label>Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select category</option>
            {available.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Monthly budget (₹)<input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
        <div className="span-2"><button className="btn" disabled={!available.length}>Set budget</button></div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <section className="panel">
        {!budgets && <p className="muted">Loading budgets…</p>}
        {budgets && !budgets.length && <p className="empty">No budgets for this month. Set one above to track your spending.</p>}
        {budgets?.map((b) => {
          const pct = Math.min((b.spent / b.amount) * 100, 100);
          const over = b.spent > b.amount;
          return (
            <div key={b._id} className="budget">
              <div className="row between">
                <strong>{b.category}</strong>
                <span>{formatINR(b.spent)} of {formatINR(b.amount)}</span>
              </div>
              <div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin="0" aria-valuemax="100" aria-label={`${b.category} budget used`}>
                <div className={over ? "bar-fill over" : pct >= 80 ? "bar-fill warn" : "bar-fill"} style={{ width: `${pct}%` }} />
              </div>
              {over && <p className="error">Over budget by {formatINR(b.spent - b.amount)}</p>}
              <div className="row">
                {editId === b._id ? (
                  <>
                    <input type="number" min="0" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} aria-label="New budget" />
                    <button className="link" onClick={() => saveEdit(b._id)}>Save</button>
                    <button className="link" onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="link" onClick={() => { setEditId(b._id); setEditAmount(String(b.amount)); }}>Edit</button>
                    <button className="link danger" onClick={() => remove(b)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
