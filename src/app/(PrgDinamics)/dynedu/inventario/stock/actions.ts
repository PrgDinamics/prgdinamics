"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type StockRow = {
  id: number;
  producto_id: number;
  stock_fisico: number;
  stock_reservado: number;
  updated_at: string | null;
  updated_by: string | null;
  productos?: {
    internal_id: string;
    descripcion: string;
    editorial: string | null;
  } | null;
};

export async function fetchStockActual(): Promise<StockRow[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("stock_actual")
      .select(
        `
        id,
        producto_id,
        stock_fisico,
        stock_reservado,
        updated_at,
        updated_by,
        productos (
          internal_id,
          descripcion,
          editorial
        )
      `
      )
      .order("producto_id", { ascending: true });

    if (error) throw error;

    // Forzamos el tipo a StockRow[] (Supabase no tipa esto por nosotros)
    return (data ?? []) as unknown as StockRow[];
  } catch (err) {
    console.error("❌ Error fetchStockActual:", err);
    return [];
  }
}

export async function actualizarStockDesdePedido(
  pedidoId: number,
  updatedBy: string = "pedido-real"
): Promise<void> {
  // 1) Traer ítems del pedido con cantidad_recibida
  const { data: items, error: itemsError } = await supabaseAdmin
    .from("pedido_items")
    .select("producto_id, cantidad_recibida")
    .eq("pedido_id", pedidoId);

  if (itemsError) {
    console.error("❌ Error leyendo pedido_items para stock:", itemsError);
    throw itemsError;
  }

  if (!items || items.length === 0) {
    // Nada que actualizar
    return;
  }

  for (const item of items) {
    const productoId = item.producto_id as number | null;
    const recibida = (item.cantidad_recibida as number | null) ?? 0;

    // Solo consideramos cantidades > 0
    if (!productoId || recibida <= 0) continue;

    // 2) Ver si ya existe registro de stock para este producto
    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("stock_actual") // ⬅️ antes decía "inventario_stock"
      .select("id, stock_fisico")
      .eq("producto_id", productoId);

    if (existingError) {
      console.error("❌ Error leyendo stock_actual:", existingError);
      throw existingError;
    }

    const existing = existingRows?.[0];
    const nowIso = new Date().toISOString();

    if (existing) {
      // 3a) Ya existe -> sumamos al stock_fisico
      const nuevoStock = (existing.stock_fisico as number) + recibida;

      const { error: updateError } = await supabaseAdmin
        .from("stock_actual") // ⬅️ antes "inventario_stock"
        .update({
          stock_fisico: nuevoStock,
          updated_at: nowIso,
          updated_by: updatedBy,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("❌ Error actualizando stock_actual:", updateError);
        throw updateError;
      }
    } else {
      // 3b) No existe -> creamos fila
      const { error: insertError } = await supabaseAdmin
        .from("stock_actual") // ⬅️ antes "inventario_stock"
        .insert([
          {
            producto_id: productoId,
            stock_fisico: recibida,
            stock_reservado: 0,
            updated_at: nowIso,
            updated_by: updatedBy,
          },
        ]);

      if (insertError) {
        console.error("❌ Error creando stock_actual:", insertError);
        throw insertError;
      }
    }
  }
}
