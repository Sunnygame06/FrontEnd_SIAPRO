// ===============================================
// CONFIG API
// ===============================================
const API_BASE = "http://localhost:8080";

// ===============================================
// OBTENER ESTADOS GUARDADOS EN LOCALSTORAGE
// ===============================================
function getEstadoLocal(idEquipo) {
  const estados = JSON.parse(localStorage.getItem("estadoEquipos") || "{}");
  return estados[idEquipo] || "Pendiente";
}

// ===============================================
// CARGAR INSUMOS (EQUIPOS)
// ===============================================
async function getEquipos() {
  try {
    const resp = await fetch(`${API_BASE}/apiEquipo/getAllEquipos?page=0&size=50`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.content || [];
  } catch (e) {
    return [];
  }
}

// ===============================================
// CARGAR SOLICITANTES
// ===============================================
async function getSolicitantes() {
  try {
    const resp = await fetch(`${API_BASE}/apiSolicitante/getAllSolicitantes?page=0&size=50`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.content || [];
  } catch (e) {
    return [];
  }
}

// ===============================================
// FUNCIÓN PRINCIPAL
// ===============================================
document.addEventListener("DOMContentLoaded", async () => {
  const equipos = await getEquipos();
  const solicitantes = await getSolicitantes();

  // ===========================
  // TARJETAS DEL DASHBOARD
  // ===========================

  // TOTAL INSUMOS
  document.querySelector(".card-info.blue h4").textContent = equipos.length;

  // TOTAL SOLICITANTES
  document.querySelector(".card-info.red h4").textContent = solicitantes.length;

  // ESTADOS (Pendiente / Entregado)
  let entregados = 0;
  let pendientes = 0;

  equipos.forEach(eq => {
    const estado = getEstadoLocal(eq.id);
    if (estado === "Entregado") entregados++;
    else pendientes++;
  });

  document.querySelector(".card-info.green h4").textContent = entregados;
  document.querySelector(".card-info.orange h4").textContent = pendientes;

  // ===========================
  // GRÁFICA DE DISTRIBUCIÓN
  // ===========================
  const conteoCategorias = {};

  equipos.forEach(eq => {
    const tipo = eq.insumo || "Otro";
    conteoCategorias[tipo] = (conteoCategorias[tipo] || 0) + eq.cantidad;
  });

  const labelsPie = Object.keys(conteoCategorias);
  const dataPie = Object.values(conteoCategorias);

  const ctxPie = document.getElementById("pieChart").getContext("2d");

  const gradAzul = ctxPie.createLinearGradient(0, 0, 0, 200);
  gradAzul.addColorStop(0, "#2457A6");
  gradAzul.addColorStop(1, "#1E4F91");

  const gradAmarillo = ctxPie.createLinearGradient(0, 0, 0, 200);
  gradAmarillo.addColorStop(0, "#F2B400");
  gradAmarillo.addColorStop(1, "#D68E00");

  const gradVerde = ctxPie.createLinearGradient(0, 0, 0, 200);
  gradVerde.addColorStop(0, "#31B24C");
  gradVerde.addColorStop(1, "#228A39");

  const gradients = [gradAzul, gradAmarillo, gradVerde];

  new Chart(ctxPie, {
    type: "doughnut",
    data: {
      labels: labelsPie,
      datasets: [
        {
          data: dataPie,
          backgroundColor: gradients.slice(0, labelsPie.length),
          borderWidth: 5,
          borderColor: "#fff",
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 14,
            padding: 16,
            font: { size: 13, weight: "500" },
          },
        },
      },
      animation: {
        duration: 1500,
        easing: "easeOutElastic",
        animateScale: true,
      },
    },
  });

  // ===========================
  // GRÁFICA DE INSUMOS POR MES
  // ===========================
  const meses = [
    "Ene","Feb","Mar","Abr","May","Jun",
    "Jul","Ago","Sep","Oct","Nov","Dic"
  ];

  const insumosPorMes = new Array(12).fill(0);

  // TODO lo que exista va directo a NOVIEMBRE (índice 10)
  equipos.forEach(eq => {
    insumosPorMes[10] += eq.cantidad;
  });

  const ctxBar = document.getElementById("barChart").getContext("2d");

  new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [
        {
          label: "Insumos Entregados",
          data: insumosPorMes,
          backgroundColor: function (ctx) {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "#2457A6");
            gradient.addColorStop(1, "#1E4F91");
            return gradient;
          },
          borderColor: "#163B6B",
          borderWidth: 1.5,
          borderRadius: 8,
          hoverBackgroundColor: "#2F65B6",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        x: { grid: { display: false } },
      },
      animation: {
        duration: 1200,
        easing: "easeOutElastic",
      },
    },
  });
});
