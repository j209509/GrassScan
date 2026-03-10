import { cn } from "@/lib/utils";

type ActivityScoreMeterProps = {
  score: number;
  compact?: boolean;
};

function getTone(score: number) {
  if (score >= 80) {
    return "from-emerald-400 to-lime-300 text-emerald-200";
  }

  if (score >= 60) {
    return "from-sky-400 to-cyan-300 text-sky-200";
  }

  if (score >= 40) {
    return "from-amber-400 to-yellow-300 text-amber-200";
  }

  return "from-zinc-500 to-zinc-300 text-zinc-200";
}

export function ActivityScoreMeter({
  score,
  compact = false,
}: ActivityScoreMeterProps) {
  const tone = getTone(score);

  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-muted",
          compact ? "h-2 w-16" : "h-2.5 w-24",
        )}
      >
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", tone)}
          style={{ width: `${Math.min(100, Math.max(score, 4))}%` }}
        />
      </div>
      <span className={cn("font-mono text-sm", tone.split(" ").at(-1))}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}
