import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import Filters, { emptyFilters } from "../components/Filters";

export default function Transactions() {
  const [items, setItems] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    setError("");
    api.listTransactions(filters).then(setItems).catch((e) => setError(e.message));
  }, [filters]);
  useEffect(load, [load]);

  async function save(data) {
    if (editing) {
      await api.updateTransaction(editing._id, data);
      setEditing(null);
      setNotice("Transaction updated");
    } else {
      await api.createTransaction(data);
      setNotice("Transaction added");
    }
    load();
  }

  async function remove(t) {
    if (!window.confirm(`Delete "${t.title}"? This can't be undone.`)) return;
    try {
      await api.deleteTransaction(t._id);
      if (editing?._id === t._id) setEditing(null);
      setNotice("Transaction deleted");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = Object.values(filters).some(Boolean);
  return (
    <>
      <TransactionForm editing={editing} onSubmit={save} onCancel={() => setEditing(null)} />
      {notice && <p className="notice" role="status" onClick={() => setNotice("")}>{notice}</p>}
      <Filters onApply={setFilters} />
      <section className="panel">
        <h2>All transactions</h2>
        {error && <p className="error" role="alert">{error}</p>}
        {!items && !error && <p className="muted">Loading transactions…</p>}
        {items && (
          <TransactionList
            items={items}
            onEdit={(t) => { setEditing(t); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onDelete={remove}
            emptyText={filtered ? "No transactions match these filters." : undefined}
          />
        )}
      </section>
    </>
  );
}
