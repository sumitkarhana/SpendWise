import { useState } from "react";
import { CATEGORIES } from "../utils";

const ALL_CATEGORIES = [...new Set([...CATEGORIES.expense, ...CATEGORIES.income])];
export const emptyFilters = { type: "", category: "", startDate: "", endDate: "", search: "" };

export default function Filters({ onApply }) {
  const [f, setF] = useState(emptyFilters);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  function apply(e) {
    e.preventDefault();
    if (f.startDate && f.endDate && f.startDate > f.endDate) return setError("Start date must be on or before the end date");
    setError("");
    onApply(f);
  }
  function reset() {
    setF(emptyFilters);
    setError("");
    onApply(emptyFilters);
  }

  return (
    <form className="panel filters" onSubmit={apply}>
      <label>Search<input value={f.search} onChange={set("search")} placeholder="Title contains…" /></label>
      <label>Type
        <select value={f.type} onChange={set("type")}>
          <option value="">All</option><option value="income">Income</option><option value="expense">Expenses</option>
        </select>
      </label>
      <label>Category
        <select value={f.category} onChange={set("category")}>
          <option value="">All</option>
          {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label>From<input type="date" value={f.startDate} onChange={set("startDate")} /></label>
      <label>To<input type="date" value={f.endDate} onChange={set("endDate")} /></label>
      <div className="row">
        <button className="btn">Apply filters</button>
        <button type="button" className="btn ghost" onClick={reset}>Reset</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
