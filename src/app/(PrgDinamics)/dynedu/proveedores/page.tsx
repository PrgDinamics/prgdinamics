import { fetchProveedores } from "./actions";
import SuppliersClient from "./SuppliersClient";

export default async function ProveedoresPage() {
  const rows = await fetchProveedores();

  return <SuppliersClient initialRows={rows} />;
}
