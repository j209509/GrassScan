import { notFound } from "next/navigation";
import { SymbolDetailClient } from "@/components/market/symbol-detail-client";
import { baseSymbolUniverse } from "@/lib/market/demo-data";
import { getBaseSymbol } from "@/lib/market/selectors";

type SymbolPageProps = {
  params: Promise<{
    symbol: string;
  }>;
};

export function generateStaticParams() {
  return baseSymbolUniverse.map((symbol) => ({
    symbol: symbol.symbol,
  }));
}

export default async function SymbolPage({ params }: SymbolPageProps) {
  const { symbol } = await params;
  const match = getBaseSymbol(symbol);

  if (!match) {
    notFound();
  }

  return <SymbolDetailClient symbol={symbol} />;
}
