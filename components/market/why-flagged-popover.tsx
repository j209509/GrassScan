import { CircleHelp } from "lucide-react";
import { FlagPill } from "@/components/market/flag-pill";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { EnrichedSymbol } from "@/lib/market/types";

type WhyFlaggedPopoverProps = {
  symbol: EnrichedSymbol;
};

export function WhyFlaggedPopover({ symbol }: WhyFlaggedPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          理由
          <CircleHelp className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[24rem] space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            検知理由
          </p>
          <p className="text-sm leading-7 text-foreground">{symbol.aiSummary}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {symbol.flags.map((flag) => (
            <FlagPill key={flag} flag={flag} />
          ))}
        </div>

        <div className="space-y-3">
          {Object.values(symbol.scoreBreakdown).map((component) => (
            <div key={component.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{component.label}</span>
                <span className="font-mono text-primary">
                  {component.contribution.toFixed(1)} 点
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${component.normalized}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
