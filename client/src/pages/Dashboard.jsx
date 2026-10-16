import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import SummaryCard from "../components/SummaryCard";
import TransactionList from "../components/TransactionList";
import { ExpensePie, MonthlyBars } from "../components/Charts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([api.summary(), api.analytics(), api.listTransactions({ limit: 5 })])
      .then(([summary, analytics, recent]) => setData({ summary, analytics, recent }))
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);

  if (error) return <div className="panel"><p className="error" role="alert">{error}</p><button className="btn" onClick={load}>Try again</button></div>;
  if (!data) return <p className="center-note">Loading your dashboard…</p>;
  const { summary, analytics, recent } = data;

  return (
    <>
      <section className="summary-row">
        <SummaryCard label="Current balance" value={summary.balance} tone="balance" large />
        <SummaryCard label="Total income" value={summary.totalIncome} tone="income" />
        <SummaryCard label="Total expenses" value={summary.totalExpenses} tone="expense" />
      </section>
      <section className="chart-row">
        <div className="panel"><h2>Spending by category</h2><ExpensePie data={analytics.expenseByCategory} /></div>
        <div className="panel"><h2>Income vs expenses by month</h2><MonthlyBars data={analytics.monthly} /></div>
      </section>
      <section className="panel">
        <div className="row between"><h2>Recent transactions</h2><Link to="/transactions" className="link">View all</Link></div>
        <TransactionList items={recent} />
      </section>
    </>
  );
}
