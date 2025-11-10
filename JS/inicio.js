// ====== CONFIG GLOBAL PARA NITIDEZ ======
Chart.defaults.font.family = "Poppins";
Chart.defaults.font.size = 13;
Chart.defaults.color = "#333";
Chart.defaults.plugins.tooltip.backgroundColor = "#333";
Chart.defaults.plugins.tooltip.cornerRadius = 6;

// ==== GRÁFICA DE BARRAS (EFECTO 3D) ====
const ctxBar = document.getElementById("barChart").getContext("2d");

new Chart(ctxBar, {
  type: "bar",
  data: {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Insumos Entregados",
        data: [10, 18, 28, 15, 8, 25, 40],
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
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowBlur: 8,
        shadowColor: "rgba(0,0,0,0.25)"
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
        ticks: { stepSize: 10 },
      },
      x: {
        grid: { display: false },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutElastic",
    },
  },
});

// ==== GRÁFICA DE DISTRIBUCIÓN (EFECTO 3D) ====
const ctxPie = document.getElementById("pieChart").getContext("2d");

// Crear degradados 3D
const gradAzul = ctxPie.createLinearGradient(0, 0, 0, 200);
gradAzul.addColorStop(0, "#2457A6");
gradAzul.addColorStop(1, "#1E4F91");

const gradAmarillo = ctxPie.createLinearGradient(0, 0, 0, 200);
gradAmarillo.addColorStop(0, "#F2B400");
gradAmarillo.addColorStop(1, "#D68E00");

const gradVerde = ctxPie.createLinearGradient(0, 0, 0, 200);
gradVerde.addColorStop(0, "#31B24C");
gradVerde.addColorStop(1, "#228A39");

new Chart(ctxPie, {
  type: "doughnut",
  data: {
    labels: ["Tinta", "Toner", "Repuesto"],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: [gradAzul, gradAmarillo, gradVerde],
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
