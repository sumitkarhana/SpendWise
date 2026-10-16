import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINR, monthLabel } from "../utils";

const COLORS = ["#E8A317", "#0F8B6D", "#3B5BDB", "#D1495B", "#8E5FD1", "#2A9DB5", "#8A93A6"];

export function ExpensePie({ data }) {
  if (!data.length) return <p className="empty">Add an expense to see where your money goes.</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="category" innerRadius={55} outerRadius={95} paddingAngle={2}>
          {data.map((d, i) => <Cell key={d.category} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => formatINR(v)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBars({ data }) {
  if (!data.length) return <p className="empty">Monthly comparison appears once you have transactions.</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data.map((d) => ({ ...d, label: monthLabel(d.month) }))}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" />
        <YAxis tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
        <Tooltip formatter={(v) => formatINR(v)} />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#0F8B6D" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#D1495B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
