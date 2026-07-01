import {
  Activity,
  CirclePlus,
  Clock3,
  Eye,
 CheckCircle2,
  ShieldX,
} from "lucide-react";

import { Metric } from "./Metric";

export function MetricsGrid({ stats }) {
  return (
    <section className="metrics-grid">
      <Metric
        label="Total"
        value={stats.total}
        icon={Activity}
      />

      <Metric
        label="New"
        value={stats.new}
        icon={CirclePlus}
      />

      <Metric
        label="Pending"
        value={stats.pending}
        icon={Clock3}
      />

      <Metric
        label="Needs Review"
        value={stats.review}
        icon={Eye}
      />

      <Metric
        label="Resolved"
        value={stats.resolved}
        icon={CheckCircle2}
      />

      <Metric
        label="Spam"
        value={stats.spam}
        icon={ShieldX}
      />
    </section>
  );
}