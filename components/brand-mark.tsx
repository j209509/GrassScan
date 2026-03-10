import Link from "next/link";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-3", compact && "gap-2", className)}
    >
      <span className="flex size-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_40px_-12px_rgba(74,222,128,0.8)]">
        <Sprout className="size-5" />
      </span>
      {!compact ? (
        <span className="flex flex-col">
          <span className="text-sm font-semibold tracking-[0.28em] text-foreground uppercase">
            GrassScan
          </span>
          <span className="text-xs text-muted-foreground">
            シグナル主導の株式ノート
          </span>
        </span>
      ) : null}
    </Link>
  );
}
