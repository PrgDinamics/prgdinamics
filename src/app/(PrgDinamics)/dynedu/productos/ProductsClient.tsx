"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Divider,
  Tooltip,
  TablePagination,
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";

import type { Producto } from "@/modules/dynedu/types";
import {
  createProducto,
  updateProducto,
  deleteProducto,
} from "./actions";
import { useSearchAndPagination } from "@/modules/dynedu/hooks/useSearchAndPagination";

type Props = {
  initialProductos: Producto[];
};

type FormState = {
  descripcion: string;
  editorial: string;
  nro_serie: string; // ISBN in UI
  autor: string;
  anio_publicacion: string; // year as string in form
};

const emptyForm: FormState = {
  descripcion: "",
  editorial: "",
  nro_serie: "",
  autor: "",
  anio_publicacion: "",
};

const ProductsClient: React.FC<Props> = ({ initialProductos }) => {
  const [productos, setProductos] =
    React.useState<Producto[]>(initialProductos ?? []);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [isSearchingIsbn, setIsSearchingIsbn] = React.useState(false);

  // Producto en edición
  const productoEnEdicion = React.useMemo(
    () => productos.find((p) => p.id === editingId) ?? null,
    [productos, editingId]
  );

  // Código que se muestra en el input:
  // - si editas → internal_id del producto
  // - si creas → calculado localmente PRO0001, PRO0002, ...
  const codigoActual = React.useMemo(() => {
    if (productoEnEdicion) return productoEnEdicion.internal_id;

    const maxNumero =
      productos
        .map((p) => p.internal_id)
        .map((id) => {
          const match = id.match(/PRO(\d+)/);
          return match ? Number(match[1]) : 0;
        })
        .reduce((max, n) => Math.max(max, n), 0) || 0;

    const siguiente = maxNumero + 1;
    return `PRO${siguiente.toString().padStart(4, "0")}`;
  }, [productoEnEdicion, productos]);

  const {
    searchTerm: productsSearch,
    setSearchTerm: setProductsSearch,
    page: productsPage,
    setPage: setProductsPage,
    rowsPerPage: productsRowsPerPage,
    filteredData: filteredProducts,
    paginatedData: paginatedProducts,
  } = useSearchAndPagination<Producto>({
    data: productos,
    rowsPerPage: 10,
    sortFn: (a, b) => b.id - a.id, // últimos arriba
    filterFn: (p, q) => {
      return (
        p.internal_id.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        (p.editorial ?? "").toLowerCase().includes(q) ||
        (p.nro_serie ?? "").toLowerCase().includes(q) ||
        (p.autor ?? "").toLowerCase().includes(q)
      );
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.descripcion.trim()) return;

    const anio =
      form.anio_publicacion.trim() === ""
        ? null
        : Number.isNaN(Number(form.anio_publicacion))
        ? null
        : Number(form.anio_publicacion);

    const payload = {
      descripcion: form.descripcion.trim(),
      editorial: form.editorial.trim() || null,
      nro_serie: form.nro_serie.trim() || null,
      autor: form.autor.trim() || null,
      anio_publicacion: anio,
    };

    if (editingId !== null && productoEnEdicion) {
      // EDITAR
      const updated = await updateProducto(productoEnEdicion.id, payload);
      if (updated) {
        setProductos((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        resetForm();
      }
    } else {
      // CREAR
      const created = await createProducto(payload);
      if (created) {
        setProductos((prev) => [...prev, created]);
        resetForm();
      }
    }
  };

  const handleEditar = (producto: Producto) => {
    setEditingId(producto.id);
    setForm({
      descripcion: producto.descripcion,
      editorial: producto.editorial ?? "",
      nro_serie: producto.nro_serie ?? "",
      autor: producto.autor ?? "",
      anio_publicacion: producto.anio_publicacion
        ? String(producto.anio_publicacion)
        : "",
    });
  };

  const handleEliminar = async (producto: Producto) => {
    const ok = window.confirm(
      `¿Eliminar el producto "${producto.descripcion}"?`
    );
    if (!ok) return;

    const deleted = await deleteProducto(producto.id);
    if (deleted) {
      setProductos((prev) => prev.filter((p) => p.id !== producto.id));
      if (editingId === producto.id) {
        resetForm();
      }
    }
  };

  const handleIsbnSearch = async () => {
    const rawIsbn = form.nro_serie.trim();
    if (!rawIsbn) {
      window.alert("Ingresa un ISBN para buscar.");
      return;
    }

    setIsSearchingIsbn(true);
    try {
      const res = await fetch(
        `/api/isbn-lookup?isbn=${encodeURIComponent(rawIsbn)}`
      );

      if (!res.ok) {
        window.alert(
          "No se encontraron datos para este ISBN. Puedes completar los campos manualmente."
        );
        return;
      }

      const data: {
        found?: boolean;
        title?: string | null;
        editorial?: string | null;
        autor?: string | null;
        anio_publicacion?: number | null;
      } = await res.json();

      if (!data.found) {
        window.alert(
          "No se encontraron datos para este ISBN. Puedes completar los campos manualmente."
        );
        return;
      }

      setForm((prev) => ({
        ...prev,
        descripcion: data.title ?? prev.descripcion,
        editorial: data.editorial ?? prev.editorial,
        autor: data.autor ?? prev.autor,
        anio_publicacion: data.anio_publicacion
          ? String(data.anio_publicacion)
          : prev.anio_publicacion,
      }));
    } catch (error) {
      console.error("Error buscando ISBN:", error);
      window.alert(
        "Hubo un problema al consultar el ISBN. Completa los campos manualmente."
      );
    } finally {
      setIsSearchingIsbn(false);
    }
  };

  // ---------------- Render ----------------

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={0.5}>
        Productos
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Registro de libros y packs. El stock real se gestiona desde el módulo
        de Inventario.
      </Typography>

      <Card variant="outlined">
        <CardHeader
          title={
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Typography variant="h6" fontWeight={600}>
                Catálogo de productos
              </Typography>
              <TextField
                size="small"
                placeholder="Buscar por código, descripción, editorial, ISBN o autor..."
                value={productsSearch}
                onChange={(e) => setProductsSearch(e.target.value)}
              />
            </Stack>
          }
          subheader="Completa los campos para registrar libros o packs en el almacén."
        />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Primera fila: Código + ISBN + Buscar */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Código"
                size="small"
                value={codigoActual}
                InputProps={{ readOnly: true }}
                sx={{ width: { xs: "100%", md: 180 } }}
              />

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  width: { xs: "100%", md: "auto" },
                  alignItems: "center",
                }}
              >
                <TextField
                  label="ISBN"
                  name="nro_serie"
                  size="small"
                  value={form.nro_serie}
                  onChange={handleChange}
                  sx={{
                    flex: { xs: 1, md: "0 0 230px" },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleIsbnSearch}
                  disabled={isSearchingIsbn}
                  sx={{
                    whiteSpace: "nowrap",
                    height: 40,
                  }}
                >
                  {isSearchingIsbn ? "Buscando..." : "Buscar"}
                </Button>
              </Stack>
            </Stack>

            {/* Segunda fila: descripción + editorial + autor + año */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Nombre"
                name="descripcion"
                size="small"
                value={form.descripcion}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Editorial"
                name="editorial"
                size="small"
                value={form.editorial}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Autor"
                name="autor"
                size="small"
                value={form.autor}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Año publicación"
                name="anio_publicacion"
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                value={form.anio_publicacion}
                onChange={handleChange}
                fullWidth
              />
            </Stack>

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              mt={1}
            >
              {editingId && (
                <Button variant="text" onClick={resetForm}>
                  Cancelar edición
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                startIcon={<IconPlus size={18} />}
              >
                {editingId ? "Guardar cambios" : "Agregar producto"}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {filteredProducts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay productos registrados.
            </Typography>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Editorial</TableCell>
                    <TableCell>ISBN</TableCell>
                    <TableCell>Autor</TableCell>
                    <TableCell>Año pub.</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {p.internal_id}
                      </TableCell>
                      <TableCell>{p.descripcion}</TableCell>
                      <TableCell>{p.editorial || "—"}</TableCell>
                      <TableCell>{p.nro_serie || "—"}</TableCell>
                      <TableCell>{p.autor || "—"}</TableCell>
                      <TableCell>
                        {p.anio_publicacion ? p.anio_publicacion : "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                        >
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              sx={{ color: "warning.main" }}
                              onClick={() => handleEditar(p)}
                            >
                              <IconEdit size={18} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              sx={{ color: "error.main" }}
                              onClick={() => handleEliminar(p)}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={filteredProducts.length}
                page={productsPage}
                onPageChange={(_, newPage) => setProductsPage(newPage)}
                rowsPerPage={productsRowsPerPage}
                rowsPerPageOptions={[productsRowsPerPage]}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${
                    count !== -1 ? count : `más de ${to}`
                  }`
                }
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductsClient;
