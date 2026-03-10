import { cn } from "@/lib/utils";

type MetricLineChartProps = {
  values: number[];
  className?: string;
};

export function MetricLineChart({
  values,
  className,
}: MetricLineChartProps) {
  if (values.length === 0) {
    return <div className={cn("h-24 rounded-3xl bg-muted/60", className)} />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-border/60 bg-background/45 p-4",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="h-28 w-full overflow-visible">
        <defs>
          <linearGradient id="grassscan-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(74, 222, 128, 0.95)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.95)" />
          </linearGradient>
        </defs>
        <path
          d={`M ${points.replace(/ /g, " L ")}`}
          fill="none"
          stroke="url(#grassscan-line)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={`M 0,100 L ${points.replace(/ /g, " L ")} L 100,100 Z`}
          fill="rgba(74, 222, 128, 0.08)"
        />
      </svg>
    </div>
  );
}
