// app/colegio/stock/page.tsx
import { fetchStockActual } from "./actions";
import StockClient from "./StockClient";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const stockRows = await fetchStockActual();

  return <StockClient initialStock={stockRows} />;
}
