// ===============================================
// CONFIG API
// ===============================================
const API_BASE = "http://localhost:8080";

// ===============================================
// OBTENER ESTADOS GUARDADOS EN LOCALSTORAGE
// ===============================================
function getEstadosGuardados() {
    return JSON.parse(localStorage.getItem("estadosEquipos") || "{}");
}

// ===============================================
// CONTAR ESTADOS DESDE LOCALSTORAGE
// ===============================================
function contarEstados(equipos) {
    const estados = getEstadosGuardados();
    let entregados = 0;
    let pendientes = 0;

    equipos.forEach(eq => {
        const estado = estados[eq.id] || "pendiente";
        if (estado === "entregado") entregados++;
        else pendientes++;
    });

    return { entregados, pendientes };
}

// ===============================================
// CARGAR INSUMOS (EQUIPOS)
// ===============================================
async function getEquipos() {
    try {
        const resp = await fetch(`${API_BASE}/apiEquipo/getAllEquipos?page=0&size=100`);
        if (!resp.ok) {
            console.error("Error HTTP:", resp.status);
            return [];
        }
        const data = await resp.json();
        console.log("RESPUESTA COMPLETA DE EQUIPOS:", data);
        
        if (Array.isArray(data)) {
            return data;
        } else if (data.content && Array.isArray(data.content)) {
            return data.content;
        } else if (data._embedded && Array.isArray(data._embedded.equipos)) {
            return data._embedded.equipos;
        } else {
            console.warn("Estructura no reconocida:", data);
            return [];
        }
    } catch (e) {
        console.error("Error cargando equipos:", e);
        return [];
    }
}

// ===============================================
// CARGAR SOLICITANTES
// ===============================================
async function getSolicitantes() {
    try {
        const resp = await fetch(`${API_BASE}/apiSolicitante/getAllSolicitantes?page=0&size=100`);
        if (!resp.ok) {
            console.error("Error HTTP:", resp.status);
            return [];
        }
        const data = await resp.json();
        console.log("RESPUESTA COMPLETA DE SOLICITANTES:", data);
        
        if (Array.isArray(data)) {
            return data;
        } else if (data.content && Array.isArray(data.content)) {
            return data.content;
        } else if (data._embedded && Array.isArray(data._embedded.solicitantes)) {
            return data._embedded.solicitantes;
        } else {
            console.warn("Estructura no reconocida:", data);
            return [];
        }
    } catch (e) {
        console.error("Error cargando solicitantes:", e);
        return [];
    }
}

// ===============================================
// ACTUALIZAR TARJETAS DEL DASHBOARD
// ===============================================
function actualizarTarjetasDashboard(equipos) {
    const { entregados, pendientes } = contarEstados(equipos);

    // TOTAL INSUMOS
    const totalInsumosElement = document.querySelector(".card-info.blue h4");
    if (totalInsumosElement) {
        totalInsumosElement.textContent = equipos.length;
    }

    // TOTAL SOLICITANTES
    const totalSolicitantesElement = document.querySelector(".card-info.red h4");
    if (totalSolicitantesElement) {
        totalSolicitantesElement.textContent = equipos.filter(eq => eq.nombre_solicitante).length;
    }

    // ESTADOS (Pendiente / Entregado)
    const entregadosElement = document.querySelector(".card-info.green h4");
    const pendientesElement = document.querySelector(".card-info.orange h4");
    
    if (entregadosElement) entregadosElement.textContent = entregados;
    if (pendientesElement) pendientesElement.textContent = pendientes;

    console.log(`Dashboard actualizado: ${entregados} entregados, ${pendientes} pendientes`);
}

// ===============================================
// GRÁFICA DE DISTRIBUCIÓN
// ===============================================
function crearGraficaDistribucion(equipos) {
    const conteoCategorias = {};
    const estados = getEstadosGuardados();

    equipos.forEach(eq => {
        const tipo = eq.insumo || "Otro";
        const estado = estados[eq.id] || "pendiente";
        
        // Solo contar los entregados para la gráfica
        if (estado === "entregado") {
            conteoCategorias[tipo] = (conteoCategorias[tipo] || 0) + (eq.cantidad || 1);
        }
    });

    const labelsPie = Object.keys(conteoCategorias);
    const dataPie = Object.values(conteoCategorias);

    const ctxPie = document.getElementById("pieChart");
    if (ctxPie && labelsPie.length > 0) {
        // Limpiar canvas existente
        const existingChart = Chart.getChart(ctxPie);
        if (existingChart) {
            existingChart.destroy();
        }

        const pieCtx = ctxPie.getContext("2d");

        const gradAzul = pieCtx.createLinearGradient(0, 0, 0, 200);
        gradAzul.addColorStop(0, "#2457A6");
        gradAzul.addColorStop(1, "#1E4F91");

        const gradAmarillo = pieCtx.createLinearGradient(0, 0, 0, 200);
        gradAmarillo.addColorStop(0, "#F2B400");
        gradAmarillo.addColorStop(1, "#D68E00");

        const gradVerde = pieCtx.createLinearGradient(0, 0, 0, 200);
        gradVerde.addColorStop(0, "#31B24C");
        gradVerde.addColorStop(1, "#228A39");

        const gradRojo = pieCtx.createLinearGradient(0, 0, 0, 200);
        gradRojo.addColorStop(0, "#E74C3C");
        gradRojo.addColorStop(1, "#C0392B");

        const gradients = [gradAzul, gradAmarillo, gradVerde, gradRojo];

        new Chart(pieCtx, {
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
                    title: {
                        display: true,
                        text: 'Insumos Entregados por Tipo',
                        font: { size: 16 }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: "easeOutElastic",
                    animateScale: true,
                },
            },
        });
    }
}

// ===============================================
// GRÁFICA DE INSUMOS POR MES
// ===============================================
function crearGraficaMensual(equipos) {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const estados = getEstadosGuardados();
    
    // Contar insumos entregados por mes (usando el mes actual como ejemplo)
    const insumosPorMes = new Array(12).fill(0);
    const mesActual = new Date().getMonth();

    equipos.forEach(eq => {
        const estado = estados[eq.id] || "pendiente";
        if (estado === "entregado") {
            insumosPorMes[mesActual] += eq.cantidad || 1;
        }
    });

    const ctxBar = document.getElementById("barChart");
    if (ctxBar) {
        // Limpiar gráfica existente
        const existingChart = Chart.getChart(ctxBar);
        if (existingChart) {
            existingChart.destroy();
        }

        const barCtx = ctxBar.getContext("2d");

        new Chart(barCtx, {
            type: "bar",
            data: {
                labels: meses,
                datasets: [
                    {
                        label: "Insumos Entregados",
                        data: insumosPorMes,
                        backgroundColor: function (ctx) {
                            const gradient = barCtx.createLinearGradient(0, 0, 0, 300);
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
                    title: {
                        display: true,
                        text: 'Insumos Entregados por Mes',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: "rgba(0,0,0,0.05)" },
                        title: {
                            display: true,
                            text: 'Cantidad'
                        }
                    },
                    x: { 
                        grid: { display: false },
                        title: {
                            display: true,
                            text: 'Meses'
                        }
                    },
                },
                animation: {
                    duration: 1200,
                    easing: "easeOutElastic",
                },
            },
        });
    }
}

// ===============================================
// FUNCIÓN PRINCIPAL
// ===============================================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Iniciando carga del dashboard...");
    
    const equipos = await getEquipos();
    const solicitantes = await getSolicitantes();

    console.log("Equipos cargados:", equipos);
    console.log("Solicitantes cargados:", solicitantes);

    // Actualizar todas las secciones del dashboard
    actualizarTarjetasDashboard(equipos);
    crearGraficaDistribucion(equipos);
    crearGraficaMensual(equipos);
});

// ===============================================
// ESCUCHAR CAMBIOS DE ESTADO DESDE EL INVENTARIO
// ===============================================
window.addEventListener('storage', function(e) {
    if (e.key === 'estadosEquipos') {
        console.log('Estado cambiado detectado, actualizando dashboard...');
        location.reload(); // Recargar para mostrar datos actualizados
    }
});

// También escuchar eventos personalizados entre pestañas
window.addEventListener('estadoCambiado', function() {
    console.log('Evento estadoCambiado recibido, actualizando dashboard...');
    location.reload();
});