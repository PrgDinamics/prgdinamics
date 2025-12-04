// src/app/(PrgDinamics)/dashboard/page.tsx
"use client";

import { Box, Stack } from "@mui/material";
import ResumenCampania from "@/app/(PrgDinamics)/dynedu/components/dashboard/ResumenCampania";
import IngresosMensuales from "@/app/(PrgDinamics)/dynedu/components/dashboard/IngresosMensuales";
import RendimientoLibros from "@/app/(PrgDinamics)/dynedu/components/dashboard/RendimientoLibros";
import UltimosPedidos from "@/app/(PrgDinamics)/dynedu/components/dashboard/UltimosPedidos";
import ResumenAnual from "@/app/(PrgDinamics)/dynedu/components/dashboard/ResumenAnual";
import PedidosPorEstadoChart from "@/app/(PrgDinamics)/dynedu/components/dashboard/PedidosPorEstadoChart";


import DistribucionColegiosChart from "@/app/(PrgDinamics)/dynedu/components/dashboard/DistribucionColegiosChart";

export default function DashboardPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Fila 1: resumen de campaña + ingresos */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ width: "100%" }}
      >
        <Box sx={{ flex: 2 }}>
          <ResumenCampania />
        </Box>
        <Box sx={{ flex: 1 }}>
          <IngresosMensuales />
        </Box>
      </Stack>

      {/* Fila 2: rendimiento de libros + últimos pedidos */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ width: "100%" }}
      >
        <Box sx={{ flex: 1 }}>
          <RendimientoLibros />
        </Box>
        <Box sx={{ flex: 1 }}>
          <UltimosPedidos />
        </Box>
      </Stack>

      {/* Fila 3: gráficos (barras + torta) */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ width: "100%" }}
      >
        <Box sx={{ flex: 1 }}>
          <PedidosPorEstadoChart />
        </Box>
        <Box sx={{ flex: 1 }}>
          <DistribucionColegiosChart />
        </Box>
      </Stack>

      {/* Fila 4: resumen por campaña/año */}
      <Box sx={{ width: "100%" }}>
        <ResumenAnual />
      </Box>
    </Box>
  );
}
