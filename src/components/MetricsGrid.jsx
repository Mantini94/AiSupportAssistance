import { Metric } from "./Metric";

export function MetricsGrid({ stats }) {
  return (
    <section className="metrics-grid">
      <Metric label="Total" value={stats.total} />
      <Metric label="New" value={stats.new} />
      <Metric label="Pending" value={stats.pending} />
      <Metric label="Needs Review" value={stats.review} />
      <Metric label="Resolved" value={stats.resolved} />
      <Metric label="Spam" value={stats.spam} />
    </section>
  );
}
