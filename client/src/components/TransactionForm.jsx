import { useEffect, useState } from "react";
import { CATEGORIES, todayISO, toInputDate } from "../utils";

const empty = () => ({ title: "", amount: "", type: "expense", category: "", date: todayISO(), description: "" });

export default function TransactionForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setError("");
    setForm(editing ? { ...editing, amount: String(editing.amount), date: toInputDate(editing.date), description: editing.description || "" } : empty());
  }, [editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value, ...(k === "type" ? { category: "" } : {}) }));

  function validate() {
    const amount = Number(form.amount);
    if (!form.title.trim()) return "Enter a title";
    if (!["income", "expense"].includes(form.type)) return "Choose income or expense";
    if (form.amount === "" || !Number.isFinite(amount) || amount <= 0) return "Enter an amount greater than zero";
    if (!form.category) return "Choose a category";
    if (!form.date || isNaN(new Date(form.date))) return "Enter a valid date";
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    setSaving(true);
    try {
      await onSubmit({ ...form, title: form.title.trim(), amount: Number(form.amount), description: form.description.trim() });
      if (!editing) setForm(empty());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel form-grid" onSubmit={submit} noValidate>
      <h2 className="span-2">{editing ? "Edit transaction" : "Add transaction"}</h2>
      <label>Title<input value={form.title} onChange={set("title")} maxLength={100} placeholder="Travel" /></label>
      <label>Amount (₹)<input type="number" step="0.01" min="0" value={form.amount} onChange={set("amount")} placeholder="3000" /></label>
      <label>Type
        <select value={form.type} onChange={set("type")}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <label>Category
        <select value={form.category} onChange={set("category")}>
          <option value="">Select category</option>
          {CATEGORIES[form.type].map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label>Date<input type="date" value={form.date} onChange={set("date")} /></label>
      <label>Description (optional)<input value={form.description} onChange={set("description")} maxLength={300} /></label>
      {error && <p className="error span-2" role="alert">{error}</p>}
      <div className="span-2 row">
        <button className="btn" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add transaction"}</button>
        {editing && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
