import { resolveRequestedMarketMode } from "@/lib/market/config";
import { resolveMarketOverviewSnapshot } from "@/lib/market/provider-resolver";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = resolveRequestedMarketMode(searchParams.get("mode"));
  const snapshot = await resolveMarketOverviewSnapshot(mode);

  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
      "x-grassscan-source": snapshot.status.source,
    },
  });
}
