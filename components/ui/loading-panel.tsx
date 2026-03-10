import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingPanel() {
  return (
    <Card className="panel-glow border-border/70 bg-card/70 backdrop-blur-sm">
      <CardHeader className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-52" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
