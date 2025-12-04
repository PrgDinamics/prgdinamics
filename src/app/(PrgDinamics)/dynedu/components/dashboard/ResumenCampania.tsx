// src/app/(PrgDinamics)/components/dashboard/ResumenCampania.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Divider,
} from "@mui/material";

const ResumenCampania: React.FC = () => {
  // TODO: conectar a Supabase y traer datos reales de la campaña activa
  const currentCampaign = {
    year: 2025,
    statusLabel: "Activa",
    schools: 18,
    orders: 42,
    deliveredBooks: 1275,
    pendingConsignments: 5,
  };

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          Resumen de la campaña
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Vista general de la campaña académica {currentCampaign.year}.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          {/* Bloque estado campaña */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Estado de la campaña
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor:
                    currentCampaign.statusLabel === "Activa"
                      ? "success.main"
                      : "text.disabled",
                }}
              />
              <Typography variant="subtitle1" fontWeight={600}>
                {currentCampaign.statusLabel}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Cuando la campaña se cierre, ya no se podrán crear nuevos pedidos
              ni consignaciones para este año.
            </Typography>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: "none", md: "block" },
              borderColor: "divider",
            }}
          />

          {/* KPIs principales */}
          <Box sx={{ flex: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Colegios activos
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {currentCampaign.schools}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Pedidos totales
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {currentCampaign.orders}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Libros entregados
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {currentCampaign.deliveredBooks.toLocaleString("es-PE")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Consignaciones pendientes
                </Typography>
                <Typography variant="h5" fontWeight={600} color="warning.main">
                  {currentCampaign.pendingConsignments}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResumenCampania;
