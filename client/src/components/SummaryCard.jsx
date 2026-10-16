import { formatINR } from "../utils";

export default function SummaryCard({ label, value, tone, large }) {
  return (
    <div className={`summary ${tone} ${large ? "large" : ""}`}>
      <span className="summary-label">{label}</span>
      <strong className="summary-value">{formatINR(value)}</strong>
    </div>
  );
}
