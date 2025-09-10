const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Endpoint público de tus compañ[email protected]
const ENDPOINT = "https://one-parking-spots-service.onrender.com/api/parking-spots";

// /data => normaliza la respuesta original
app.get("/data", async (req, res) => {
  try {
    const response = await axios.get(ENDPOINT);
    const datos = Array.isArray(response.data) ? response.data : [];
    const normalizados = datos.map(spot => ({
      id: spot.id,
      estado: spot.status || spot.estado || null,
      inicio: spot.start_time || spot.hora_de_inicio || spot.fecha_inicial || null,
      fin: spot.end_time || spot.hora_de_fin || spot.fecha_final || spot.hora_final || null,
      latitud: spot.lat || spot.latitud || null,
      longitud: spot.lon || spot.longitud || null,
      usuario: spot.user || spot.usuario || null
    }));
    res.json(normalizados);
  } catch (err) {
    console.error("Error /data:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// /ocupacion => resumen rápido (ideal para Grafana)
app.get("/ocupacion", async (req, res) => {
  try {
    const response = await axios.get(ENDPOINT);
    const datos = Array.isArray(response.data) ? response.data : [];
    const total = datos.length;
    let ocupado = 0;
    for (const s of datos) {
      const status = String(s.status || s.estado || "").toLowerCase();
      if (status.includes("ocup")) ocupado++;
    }
    const vacio = total - ocupado;
    const ocupado_percent = total ? +(ocupado / total * 100).toFixed(2) : 0;
    const vacio_percent = total ? +(vacio / total * 100).toFixed(2) : 0;

    const summary = {
      ocupado,
      vacio,
      total,
      ocupado_percent,
      vacio_percent
    };

    const values = [
      { estado: "ocupado", count: ocupado },
      { estado: "vacío", count: vacio }
    ];

    res.json({ summary, values });
  } catch (err) {
    console.error("Error /ocupacion:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Root → redirige a /data (evita "Cannot GET /")
app.get("/", (req, res) => res.redirect("/data"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
