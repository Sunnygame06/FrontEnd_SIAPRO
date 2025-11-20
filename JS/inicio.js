// ===============================
// CONFIG
// ===============================
const API_BASE = "http://localhost:8080";
const COLORS = [
  "#2563eb","#10b981","#f59e0b","#ef4444","#8b5cf6",
  "#14b8a6","#f43f5e","#22c55e","#3b82f6","#a855f7"
];

// ===============================
// LOCALSTORAGE
// ===============================
function getEstadosGuardados() {
  try {
    return JSON.parse(localStorage.getItem("estadosEquipos") || "{}");
  } catch {
    return {};
  }
}

function getEstadoObj(id) {
  const raw = getEstadosGuardados()[id];
  if (!raw) return { estado: "pendiente", fecha: null };
  if (typeof raw === "string") return { estado: raw.toLowerCase(), fecha: null };
  if (typeof raw === "object") return { estado: (raw.estado||"pendiente").toLowerCase(), fecha: raw.fecha||null };
  return { estado: "pendiente", fecha: null };
}

function setEstadoLocalWithDate(id, estado) {
  const estados = getEstadosGuardados();
  estados[id] = { estado, fecha: new Date().toISOString() };
  localStorage.setItem("estadosEquipos", JSON.stringify(estados));
  window.dispatchEvent(new Event("estadoCambiado"));
}

// ===============================
// FETCH API
// ===============================
async function getEquipos() {
  try {
    const resp = await fetch(`${API_BASE}/apiEquipo/getAllEquipos`);
    if (!resp.ok) return [];
    const json = await resp.json();
    if (Array.isArray(json)) return json;
    if (json.content && Array.isArray(json.content)) return json.content;
    return [];
  } catch { return []; }
}

async function getSolicitantes() {
  try {
    const resp = await fetch(`${API_BASE}/apiSolicitante/getAllSolicitantes`);
    if (!resp.ok) return [];
    const json = await resp.json();
    if (Array.isArray(json)) return json;
    if (json.content && Array.isArray(json.content)) return json.content;
    return [];
  } catch { return []; }
}

// ===============================
// TARJETAS
// ===============================
function contarEstados(equipos) {
  let entregados = 0, pendientes = 0;
  equipos.forEach(eq => {
    const id = eq.id || eq.id_equipo;
    const { estado } = getEstadoObj(id);
    if (estado === "entregado") entregados++;
    else pendientes++;
  });
  return { entregados, pendientes };
}

function actualizarTarjetasDashboard(equipos, solicitantes) {
  document.querySelector(".card-info.blue h4").textContent = equipos.length;
  document.querySelector(".card-info.red h4").textContent = solicitantes.length;
  const { entregados, pendientes } = contarEstados(equipos);
  document.querySelector(".card-info.green h4").textContent = entregados;
  document.querySelector(".card-info.orange h4").textContent = pendientes;
}

// ===============================
// PIE – TIPOS DE INSUMO
// ===============================
function crearGraficaTipos(equipos) {
  const stats = {};
  equipos.forEach(eq => {
    let tipo = eq.insumo || eq.tipo || "Otro";
    if (typeof tipo === "object" && tipo !== null) tipo = tipo.nombre || tipo.tipo || tipo.descripcion || "Otro";
    tipo = tipo.toString().trim();
    if (!stats[tipo]) stats[tipo] = 0;
    stats[tipo]++;
  });

  const labels = Object.keys(stats);
  const data = Object.values(stats);
  const canvas = document.getElementById("pieChart");
  if (!canvas) return;
  const old = Chart.getChart(canvas);
  if (old) old.destroy();

  new Chart(canvas.getContext("2d"), {
    type: "pie",
    data: { labels, datasets: [{ data, backgroundColor: COLORS.slice(0, labels.length) }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
  });
}

// ===============================
// BAR – ENTREGADOS POR MES
// ===============================
function crearGraficaMensual(equipos) {
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const dataMes = new Array(12).fill(0);

  equipos.forEach(eq => {
    const id = eq.id || eq.id_equipo;
    const { estado, fecha } = getEstadoObj(id);

    // Si no hay fecha, asumimos que entregado hoy para prueba
    if (estado === "entregado") {
      const d = fecha ? new Date(fecha) : new Date();
      if (!isNaN(d)) dataMes[d.getMonth()]++;
    }
  });

  const canvas = document.getElementById("barChart");
  if (!canvas) return;

  const old = Chart.getChart(canvas);
  if (old) old.destroy();

  new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: meses,
      datasets: [{
        label: "Entregados",
        data: dataMes,
        backgroundColor: COLORS
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ===============================
// INIT DASHBOARD
// ===============================
async function initDashboard() {
  const equipos = await getEquipos();
  const solicitantes = await getSolicitantes();
  actualizarTarjetasDashboard(equipos, solicitantes);
  crearGraficaTipos(equipos);
  crearGraficaMensual(equipos);
}

document.addEventListener("DOMContentLoaded", initDashboard);
window.addEventListener("estadoCambiado", initDashboard);

// Exponer funciones globales
window.__SIAPRO = { setEstadoLocalWithDate, getEstadoObj, initDashboard };
