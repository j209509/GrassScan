import { resolveRequestedMarketMode } from "@/lib/market/config";
import { resolveMarketSymbolSnapshot } from "@/lib/market/provider-resolver";

export const dynamic = "force-dynamic";

type SymbolRouteContext = {
  params: Promise<{
    symbol: string;
  }>;
};

export async function GET(request: Request, context: SymbolRouteContext) {
  const { searchParams } = new URL(request.url);
  const { symbol } = await context.params;
  const mode = resolveRequestedMarketMode(searchParams.get("mode"));
  const snapshot = await resolveMarketSymbolSnapshot(mode, symbol);

  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
      "x-grassscan-source": snapshot.status.source,
    },
  });
}
