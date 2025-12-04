"use client";

import React from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";

import type { Proveedor } from "@/modules/dynedu/types";
import { createProveedor, updateProveedor, deleteProveedor } from "./actions";

type SuppliersClientProps = {
  initialRows: Proveedor[];
};

type FormState = {
  razon_social: string;
  ruc: string;
  contacto_nombre: string;
  contacto_celular: string;
  contacto_correo: string;
};

const emptyForm: FormState = {
  razon_social: "",
  ruc: "",
  contacto_nombre: "",
  contacto_celular: "",
  contacto_correo: "",
};

const SuppliersClient: React.FC<SuppliersClientProps> = ({ initialRows }) => {
  const [proveedores, setProveedores] = React.useState<Proveedor[]>(initialRows);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Si cambian las filas iniciales (navegación, refresco server, etc.)
  React.useEffect(() => {
    setProveedores(initialRows);
  }, [initialRows]);

  // -----------------------------
  // Código humano PRV0001...
  // -----------------------------
  const proveedorEnEdicion = React.useMemo(
    () => proveedores.find((p) => p.id === editingId) ?? null,
    [proveedores, editingId]
  );

  const codigoActual = React.useMemo(() => {
    if (proveedorEnEdicion) return proveedorEnEdicion.internal_id;

    if (proveedores.length === 0) return "PRV0001";

    const maxNum = Math.max(
      ...proveedores.map((p) => {
        const match = p.internal_id.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
    );

    const next = maxNum + 1;
    return `PRV${String(next).padStart(4, "0")}`;
  }, [proveedores, proveedorEnEdicion]);

  // -----------------------------
  // Formulario
  // -----------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.razon_social.trim() || !form.ruc.trim()) return;

    setLoading(true);

    try {
      if (editingId && proveedorEnEdicion) {
        // EDITAR
        const updated = await updateProveedor(editingId, {
          razon_social: form.razon_social.trim(),
          ruc: form.ruc.trim(),
          contacto_nombre: form.contacto_nombre.trim(),
          contacto_celular: form.contacto_celular.trim(),
          contacto_correo:
            form.contacto_correo.trim() === ""
              ? null
              : form.contacto_correo.trim(),
        });

        if (updated) {
          setProveedores((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }
      } else {
        // CREAR
        const created = await createProveedor({
          razon_social: form.razon_social.trim(),
          ruc: form.ruc.trim(),
          contacto_nombre: form.contacto_nombre.trim(),
          contacto_celular: form.contacto_celular.trim(),
          contacto_correo:
            form.contacto_correo.trim() === ""
              ? null
              : form.contacto_correo.trim(),
        });

        if (created) {
          setProveedores((prev) => [...prev, created]);
        }
      }
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const handleEdit = (prov: Proveedor) => {
    setEditingId(prov.id);
    setForm({
      razon_social: prov.razon_social,
      ruc: prov.ruc,
      contacto_nombre: prov.contacto_nombre,
      contacto_celular: prov.contacto_celular,
      contacto_correo: prov.contacto_correo ?? "",
    });
  };

  const handleDelete = async (prov: Proveedor) => {
    const ok = window.confirm(
      `¿Eliminar al proveedor "${prov.internal_id} - ${prov.razon_social}"?`
    );
    if (!ok) return;

    setLoading(true);
    try {
      const success = await deleteProveedor(prov.id);
      if (success) {
        setProveedores((prev) => prev.filter((p) => p.id !== prov.id));
        if (editingId === prov.id) resetForm();
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={0.5}>
        Proveedores
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Listado de editoriales y proveedores académicos conectados al almacén.
      </Typography>

      {/* FORM */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconPlus size={18} />
              <Typography variant="subtitle1" fontWeight={600}>
                {editingId ? "Editar proveedor" : "Agregar proveedor"}
              </Typography>
            </Stack>
          }
          subheader="Completa los datos del proveedor que abastece libros o packs al colegio."
        />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Código"
                size="small"
                value={codigoActual}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Razón social *"
                name="razon_social"
                size="small"
                value={form.razon_social}
                onChange={handleChange}
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="RUC *"
                name="ruc"
                size="small"
                value={form.ruc}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Contacto (nombre)"
                name="contacto_nombre"
                size="small"
                value={form.contacto_nombre}
                onChange={handleChange}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Celular"
                name="contacto_celular"
                size="small"
                value={form.contacto_celular}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Correo"
                name="contacto_correo"
                size="small"
                value={form.contacto_correo}
                onChange={handleChange}
                fullWidth
              />
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} mt={1}>
              {editingId && (
                <Button variant="text" onClick={resetForm}>
                  Cancelar edición
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                startIcon={<IconPlus size={18} />}
                disabled={loading}
              >
                {editingId ? "Guardar cambios" : "Agregar proveedor"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Proveedores registrados
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Razón social</TableCell>
                <TableCell>RUC</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Celular</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proveedores.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {p.internal_id}
                  </TableCell>
                  <TableCell>{p.razon_social}</TableCell>
                  <TableCell>{p.ruc}</TableCell>
                  <TableCell>{p.contacto_nombre}</TableCell>
                  <TableCell>{p.contacto_celular}</TableCell>
                  <TableCell>{p.contacto_correo || "—"}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          sx={{ color: "warning.main" }}
                          onClick={() => handleEdit(p)}
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          sx={{ color: "error.main" }}
                          onClick={() => handleDelete(p)}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {proveedores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      No hay proveedores registrados todavía.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuppliersClient;
