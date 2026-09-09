import { MetricCard } from "@/components/ui/MetricCard";
import type { MetricCard as MetricCardType } from "@/types/dashboard";

interface MetricsRowProps {
  metrics: MetricCardType[];
}

export function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} data={metric} />
      ))}
    </div>
  );
}