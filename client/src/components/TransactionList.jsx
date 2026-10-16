import { formatDate, formatINR } from "../utils";

export default function TransactionList({ items, onEdit, onDelete, emptyText }) {
  if (!items.length) return <p className="empty">{emptyText || "No transactions yet. Add your first one to see it here."}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Title</th><th>Category</th><th className="num">Amount</th>{(onEdit || onDelete) && <th></th>}</tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t._id}>
              <td>{formatDate(t.date)}</td>
              <td>{t.title}{t.description && <small className="muted"> {t.description}</small>}</td>
              <td>{t.category}</td>
              <td className={`num ${t.type}`}>{t.type === "income" ? "+" : "−"}{formatINR(t.amount)}</td>
              {(onEdit || onDelete) && (
                <td className="actions">
                  {onEdit && <button className="link" onClick={() => onEdit(t)}>Edit</button>}
                  {onDelete && <button className="link danger" onClick={() => onDelete(t)}>Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
