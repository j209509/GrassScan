import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="panel-glow border-border/70 bg-card/70 backdrop-blur-sm">
      <CardHeader className="items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10">
          <Icon className="size-6 text-primary" />
        </div>
        <CardTitle className="mt-4 text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
