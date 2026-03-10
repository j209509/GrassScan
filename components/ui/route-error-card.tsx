"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RouteErrorCardProps = {
  title: string;
  description: string;
  reset: () => void;
};

export function RouteErrorCard({
  title,
  description,
  reset,
}: RouteErrorCardProps) {
  return (
    <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
      <CardHeader className="items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-3xl border border-amber-400/20 bg-amber-400/10">
          <TriangleAlert className="size-6 text-amber-200" />
        </div>
        <CardTitle className="mt-4 text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
        <Button type="button" onClick={reset}>
          再試行
        </Button>
      </CardContent>
    </Card>
  );
}
