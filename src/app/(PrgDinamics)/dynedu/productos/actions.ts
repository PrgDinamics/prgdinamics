"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type {
  Producto,
  ProductoCreateInput,
  ProductoUpdateInput,
} from "@/modules/dynedu/types";

const TABLE = "productos";

export async function fetchProductos(): Promise<Producto[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetchProductos:", error);
    return [];
  }

  return data as Producto[];
}

// Genera el siguiente código PRO0001, PRO0002, etc. directamente desde BD
async function generateNextInternalId(): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("internal_id")
    .order("internal_id", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error generateNextInternalId:", error);
    return "PRO0001";
  }

  let next = 1;

  if (data && data.length > 0 && data[0].internal_id) {
    const match = data[0].internal_id.match(/(\d+)$/);
    if (match) {
      next = Number.parseInt(match[1], 10) + 1;
    }
  }

  return `PRO${String(next).padStart(4, "0")}`;
}

export async function createProducto(
  input: Omit<ProductoCreateInput, "internal_id">
): Promise<Producto | null> {
  const internal_id = await generateNextInternalId();

  const payload: ProductoCreateInput = {
    internal_id,
    descripcion: input.descripcion,
    editorial: input.editorial ?? null,
    nro_serie: input.nro_serie ?? null,
    stock: input.stock ?? 0,
  };

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Error createProducto:", error);
    return null;
  }

  return data as Producto;
}

export async function updateProducto(
  id: number,
  input: ProductoUpdateInput
): Promise<Producto | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updateProducto:", error);
    return null;
  }

  return data as Producto;
}

export async function deleteProducto(id: number): Promise<boolean> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error("Error deleteProducto:", error);
    return false;
  }

  return true;
}
