"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type {
  Proveedor,
  ProveedorCreateInput,
  ProveedorUpdateInput,
} from "@/modules/dynedu/types";

// -------------------------------------
// Helpers
// -------------------------------------

async function generarSiguienteCodigoProveedor(): Promise<string> {
  // Tomamos el último internal_id y le sumamos 1 → PRV0001, PRV0002, etc.
  const { data, error } = await supabaseAdmin
    .from("proveedores")
    .select("internal_id")
    .order("internal_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error obtener último proveedor:", error);
    return "PRV0001";
  }

  if (!data?.internal_id) return "PRV0001";

  const match = data.internal_id.match(/(\d+)$/);
  const lastNumber = match ? parseInt(match[1], 10) : 0;
  const next = lastNumber + 1;

  return `PRV${String(next).padStart(4, "0")}`;
}

// -------------------------------------
// Fetch
// -------------------------------------

export async function fetchProveedores(): Promise<Proveedor[]> {
  const { data, error } = await supabaseAdmin
    .from("proveedores")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetchProveedores:", error);
    return [];
  }

  return data as Proveedor[];
}

// -------------------------------------
// Create
// -------------------------------------

export async function createProveedor(
  input: Omit<ProveedorCreateInput, "internal_id">
): Promise<Proveedor | null> {
  try {
    const internal_id = await generarSiguienteCodigoProveedor();

    const payload: ProveedorCreateInput = {
      internal_id,
      razon_social: input.razon_social,
      ruc: input.ruc,
      contacto_nombre: input.contacto_nombre,
      contacto_celular: input.contacto_celular,
      contacto_correo: input.contacto_correo ?? null,
    };

    const { data, error } = await supabaseAdmin
      .from("proveedores")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("Error createProveedor:", error);
      return null;
    }

    // Para que el server refresque en caso de navegación
    revalidatePath("/colegio/proveedores");

    return data as Proveedor;
  } catch (err) {
    console.error("Excepción createProveedor:", err);
    return null;
  }
}

// -------------------------------------
// Update
// -------------------------------------

export async function updateProveedor(
  id: number,
  cambios: ProveedorUpdateInput
): Promise<Proveedor | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("proveedores")
      .update(cambios)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updateProveedor:", error);
      return null;
    }

    revalidatePath("/colegio/proveedores");

    return data as Proveedor;
  } catch (err) {
    console.error("Excepción updateProveedor:", err);
    return null;
  }
}

// -------------------------------------
// Delete
// -------------------------------------

export async function deleteProveedor(id: number): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("proveedores")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleteProveedor:", error);
      return false;
    }

    revalidatePath("/colegio/proveedores");
    return true;
  } catch (err) {
    console.error("Excepción deleteProveedor:", err);
    return false;
  }
}
