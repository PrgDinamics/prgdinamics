// src/modules/colegio/types.ts

// ---------------------------------------------
// Tipos base compartidos
// ---------------------------------------------

export type BaseEntity = {
  id: number;
  created_at?: string;
  updated_at?: string;
};

// ---------------------------------------------
// PRODUCTOS
// ---------------------------------------------

// Registro de la tabla "productos"
export type Producto = BaseEntity & {
  /**
   * ID humano que ve el usuario. Ej: PRO001, PRO002...
   * El `id` numérico queda como interno de BD.
   */
  internal_id: string;

  descripcion: string;
  editorial: string | null;
  /**
   * Lo usamos como ISBN (en BD sigue llamándose nro_serie).
   */
  nro_serie: string | null;

  /** Campo opcional por si luego quieres guardar "5.º Primaria", etc. */
  nivel?: string | null;

  /** Autor o autores del libro */
  autor?: string | null;

  /** Año de publicación (ej: 2023) */
  anio_publicacion?: number | null;

  /** Stock actual en almacén (se llena desde inventario/stock_actual) */
  stock: number;
};

export type ProductoCreateInput = {
  internal_id: string;
  descripcion: string;
  editorial?: string | null;
  nro_serie?: string | null;
  autor?: string | null;
  anio_publicacion?: number | null;
  stock?: number;
};

// Datos para actualizar un producto (todos opcionales)
export type ProductoUpdateInput = {
  descripcion?: string;
  editorial?: string | null;
  nro_serie?: string | null;
  autor?: string | null;
  anio_publicacion?: number | null;
  stock?: number;
};


// ---------------------------------------------
// PROVEEDORES
// ---------------------------------------------

export type Proveedor = BaseEntity & {
  /** Código humano: PRV001, PRV002, etc. */
  internal_id: string;

  razon_social: string;
  ruc: string;

  contacto_nombre: string;
  contacto_celular: string;
  contacto_correo?: string | null;
  total_pedidos?: number;
  total_unidades?: number;
};

export type ProveedorCreateInput = {
  internal_id: string;
  razon_social: string;
  ruc: string;
  contacto_nombre: string;
  contacto_celular: string;
  contacto_correo?: string | null;
};

export type ProveedorUpdateInput = Partial<
  Omit<Proveedor, 'id' | 'created_at' | 'updated_at' | 'internal_id'>
>;

// ---------------------------------------------
// PEDIDOS (simplificados para el dashboard)
// ---------------------------------------------

export type PedidoEstado =  'PENDIENTE' | 'PARCIAL' | 'COMPLETO';

export type Pedido = BaseEntity & {
  /** Código de pedido: PED0001, PED0002, etc. */
  codigo: string;

  proveedor_id: number;
  proveedor_nombre: string;

  fecha_registro: string;      // ISO string
  fecha_entrega?: string | null;

  estado: PedidoEstado;

  unidades_solicitadas: number;
  unidades_recibidas: number;

  doc_ref?: string | null;  
};

export type PedidoItem = {
  id: number;
  pedido_id: number;
  producto_id: number;
  producto_descripcion: string;
  cantidad_solicitada: number;
  cantidad_recibida: number;
};

// ==== Colegios (portal colegios / usuario-colegio) ====

export type Colegio = {
  id: number;
  ruc: string;
  razon_social: string | null;
  nombre: string; // NOMBRE (como los conocemos) / nombre_comercial
  direccion: string | null;
  referencia: string | null;
  contacto_nombre: string | null;
  contacto_email: string | null;
  contacto_celular: string | null;
  access_key: string | null;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CreateColegioInput = {
  ruc: string;
  razon_social: string;
  nombre: string; // nombre comercial
  direccion?: string;
  referencia?: string;
  contacto_nombre?: string;
  contacto_email?: string;
  contacto_celular?: string;
};

export type UpdateColegioInput = {
  ruc: string;
  razon_social: string;
  nombre: string;
  direccion?: string;
  referencia?: string;
  contacto_nombre?: string;
  contacto_email?: string;
  contacto_celular?: string;
  activo: boolean;
};

