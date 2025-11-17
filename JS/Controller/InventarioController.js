import { EquipoService } from "../Services/InventarioService.js";

const service = new EquipoService();
const tbody = document.getElementById("tbody-inventario");

// Modal Bootstrap
const modal = new bootstrap.Modal(document.getElementById("verModal"));

// Elementos del modal
const detalleMarca = document.getElementById("detalleMarca");
const detalleModelo = document.getElementById("detalleModelo");
const detalleSerie = document.getElementById("detalleSerie");
const detalleInventario = document.getElementById("detalleInventario");
const detalleAsignado = document.getElementById("detalleAsignado");
const detalleInstalado = document.getElementById("detalleInstalado");
const detalleInsumo = document.getElementById("detalleInsumo");
const detalleMarcaInsumo = document.getElementById("detalleMarcaInsumo");
const detalleDescripcion = document.getElementById("detalleDescripcion");
const detallePresentacion = document.getElementById("detallePresentacion");
const detalleEstado = document.getElementById("detalleEstado");
const detalleOrigen = document.getElementById("detalleOrigen");

// ======================================================
// FUNCIONES PARA MANEJAR ESTADOS EN LOCALSTORAGE
// ======================================================
function guardarEstado(idEquipo, estado) {
    const estados = JSON.parse(localStorage.getItem("estadosEquipos") || "{}");
    estados[idEquipo] = estado;
    localStorage.setItem("estadosEquipos", JSON.stringify(estados));
    
    // Disparar eventos para actualizar otras pestañas
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('estadoCambiado'));
    
    console.log(`Estado guardado: Equipo ${idEquipo} -> ${estado}`);
}

function obtenerEstado(idEquipo) {
    const estados = JSON.parse(localStorage.getItem("estadosEquipos") || "{}");
    return estados[idEquipo] || "pendiente";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarInventario();
    cargarSolicitantes();
});

// ======================================================
// Cargar inventario
// ======================================================
async function cargarInventario() {
    try {
        const equipos = await service.getAllEquipos();

        tbody.innerHTML = "";

        if (!equipos || equipos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">No hay registros</td>
                </tr>
            `;
            return;
        }

        equipos.forEach(item => crearFila(item));

    } catch (error) {
        console.error("Error cargando inventario:", error);
    }
}

// ======================================================
// Crear fila en tabla
// ======================================================
function crearFila(item) {
    const tr = document.createElement("tr");
    const estadoGuardado = obtenerEstado(item.id);

    tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.marca}</td>
        <td>${item.modelo}</td>
        <td>${item.serie}</td>
        <td>${item.inventario}</td>
        <td>${item.nombre_solicitante || "Sin asignar"}</td>
        <td>${item.instalado_en || "Sin ubicación"}</td>

        <td>
            <i class="fa-solid fa-pen-to-square text-primary me-2 btn-editar" data-id="${item.id}"></i>
            <i class="fa-solid fa-trash text-danger me-2 btn-eliminar" data-id="${item.id}"></i>

            <i class="fa-solid fa-eye text-secondary me-2 ver-detalle"
                data-json='${JSON.stringify(item)}'>
            </i>

            <select class="estado-select form-select form-select-sm" style="width:auto;" data-id="${item.id}">
                <option value="pendiente" ${estadoGuardado === "pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="entregado" ${estadoGuardado === "entregado" ? "selected" : ""}>Entregado</option>
            </select>
        </td>
    `;

    tbody.appendChild(tr);

    // Aplicar color inicial basado en el estado guardado
    aplicarColorFila(tr, estadoGuardado);

    // Event listeners
    tr.querySelector(".ver-detalle").addEventListener("click", () => abrirModalDetalle(item));
    tr.querySelector(".btn-editar").addEventListener("click", () => cargarFormularioEdicion(item));
    tr.querySelector(".btn-eliminar").addEventListener("click", (e) => eliminarEquipo(e.target.dataset.id, tr));

    const selectEstado = tr.querySelector(".estado-select");
    selectEstado.addEventListener("change", (e) => {
        const nuevoEstado = e.target.value;
        const equipoId = e.target.dataset.id;
        
        guardarEstado(equipoId, nuevoEstado);
        aplicarColorFila(tr, nuevoEstado);
        
        // Mostrar confirmación
        Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: `Equipo marcado como ${nuevoEstado}`,
            timer: 1500,
            showConfirmButton: false
        });
    });
}

// ======================================================
// Modal Detalles
// ======================================================
function abrirModalDetalle(item) {
    const estadoActual = obtenerEstado(item.id);
    
    detalleMarca.textContent = item.marca || "N/A";
    detalleModelo.textContent = item.modelo || "N/A";
    detalleSerie.textContent = item.serie || "N/A";
    detalleInventario.textContent = item.inventario || "N/A";
    detalleAsignado.textContent = item.nombre_solicitante || "Sin asignar";
    detalleInstalado.textContent = item.instalado_en || "Sin ubicación";
    detalleInsumo.textContent = item.insumo || "N/A";
    detalleMarcaInsumo.textContent = item.marca || "N/A";
    detalleDescripcion.textContent = item.descripcion || "N/A";
    detallePresentacion.textContent = item.presentacion_ml || "N/A";
    detalleEstado.textContent = estadoActual === "entregado" ? "Entregado" : "Pendiente";
    detalleOrigen.textContent = item.origen || "N/A";

    modal.show();
}

// ======================================================
// Colores por estado
// ======================================================
function aplicarColorFila(fila, estado) {
    fila.classList.remove("estado-pendiente", "estado-entregado");
    
    if (estado === "entregado") {
        fila.classList.add("estado-entregado");
        fila.style.backgroundColor = "#d4edda"; // Verde claro
    } else {
        fila.classList.add("estado-pendiente");
        fila.style.backgroundColor = "#fff3cd"; // Amarillo claro
    }
}

// ======================================================
// Filtro
// ======================================================
const filtroEstado = document.getElementById("filtro-estado");
if (filtroEstado) {
    filtroEstado.addEventListener("change", () => filtrarPorEstado(filtroEstado.value));
}

function filtrarPorEstado(estado) {
    const filas = tbody.querySelectorAll("tr");

    filas.forEach(fila => {
        const selectEstado = fila.querySelector(".estado-select");
        const estadoFila = selectEstado ? selectEstado.value : "pendiente";
        fila.style.display = (estado === "todos" || estado === estadoFila) ? "" : "none";
    });
}

/* ============================================================
   DEPENDENCIAS EPSON → TINTA → WORKFORCE
   ============================================================ */

const marcaAdd = document.getElementById("marcaAdd");
const marcaInsumoAdd = document.getElementById("marcaInsumoAdd");
const estadoAdd = document.getElementById("estadoAdd");

// Configurar estado del equipo (no confundir con estado de entrega)
if (estadoAdd) {
    estadoAdd.innerHTML = `
        <option value="">Seleccione estado</option>
        <option value="Nuevo">Nuevo</option>
        <option value="Semi-nuevo">Semi-nuevo</option>
    `;
}

if (marcaAdd && marcaInsumoAdd) {
    marcaAdd.addEventListener("change", () => {
        marcaInsumoAdd.value = marcaAdd.value;
        marcaInsumoAdd.readOnly = true;
    });
}

const insumoAdd = document.getElementById("insumoAdd");
const modeloAdd = document.getElementById("modeloAdd");

if (marcaAdd && insumoAdd && modeloAdd) {
    marcaAdd.addEventListener("change", () => {
        if (marcaAdd.value === "EPSON") {
            insumoAdd.innerHTML = `
                <option value="">Seleccione insumo</option>
                <option value="TINTA">TINTA</option>
            `;
        } else {
            insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;
            modeloAdd.innerHTML = `<option value="">Seleccione modelo</option>`;
        }
    });

    if (insumoAdd) {
        insumoAdd.addEventListener("change", () => {
            modeloAdd.innerHTML =
                insumoAdd.value === "TINTA"
                    ? `<option value="">Seleccione modelo</option><option value="WORKFORCE WF-CS810">WORKFORCE WF-CS810</option>`
                    : `<option value="">Seleccione modelo</option>`;
        });
    }
}

/* ============================================================
   GUARDAR / ACTUALIZAR
   ============================================================ */

const btnGuardar = document.querySelector(".btn-guardar");
const serieAdd = document.getElementById("serieAdd");
const inventarioAdd = document.getElementById("inventarioAdd");
const asignadoAdd = document.getElementById("asignadoAdd");
const instaladoAdd = document.getElementById("instaladoAdd");
const descripcionAdd = document.getElementById("descripcionAdd");
const cantidadAdd = document.getElementById("cantidadAdd");
const origenAdd = document.getElementById("origenAdd");

if (btnGuardar) {
    btnGuardar.addEventListener("click", async () => {
        if (!marcaAdd.value || !modeloAdd.value || !inventarioAdd.value) {
            Swal.fire({ icon: "warning", title: "Campos incompletos", text: "Debes completar todos los campos obligatorios." });
            return;
        }

        const equipoData = {
            marca: marcaAdd.value,
            modelo: modeloAdd.value,
            serie: serieAdd.value,
            inventario: inventarioAdd.value,
            nombre_solicitante: asignadoAdd.options[asignadoAdd.selectedIndex].text,
            instalado_en: instaladoAdd.value,
            insumo: insumoAdd.value,
            descripcion: descripcionAdd.value,
            cantidad: parseInt(cantidadAdd.value),
            estado: estadoAdd.value,
            origen: origenAdd.value
        };

        // === PUT (modo edición) ===
        if (btnGuardar.classList.contains("modo-edicion")) {
            const respuesta = await service.updateEquipo(window.idEditando, equipoData);

            if (respuesta?.status === "Actualizado") {
                Swal.fire({ icon: "success", title: "Actualizado", timer: 1800, showConfirmButton: false });
                cargarInventario();
                limpiarFormulario();
            } else {
                Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar." });
            }
            return;
        }

        // === POST ===
        const resultado = await service.crearEquipo(equipoData);

        if (resultado?.status === "Completado") {
            Swal.fire({ icon: "success", title: "Guardado", timer: 1800, showConfirmButton: false });
            
            // Guardar estado por defecto como "pendiente" para el nuevo equipo
            if (resultado.data && resultado.data.id) {
                guardarEstado(resultado.data.id, "pendiente");
            }
            
            cargarInventario(); // Recargar toda la tabla para incluir el nuevo equipo
            limpiarFormulario();
        } else {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo guardar." });
        }
    });
}

function limpiarFormulario() {
    if (marcaAdd) marcaAdd.value = "";
    if (modeloAdd) modeloAdd.innerHTML = `<option value="">Seleccione modelo</option>`;
    if (insumoAdd) insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;
    if (serieAdd) serieAdd.value = "";
    if (inventarioAdd) inventarioAdd.value = "";
    if (asignadoAdd) asignadoAdd.value = "";
    if (instaladoAdd) instaladoAdd.value = "";
    if (descripcionAdd) descripcionAdd.value = "";
    if (cantidadAdd) cantidadAdd.value = 1;
    if (estadoAdd) estadoAdd.value = "";
    if (origenAdd) {
        origenAdd.value = "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";
    }
    if (btnGuardar) {
        btnGuardar.textContent = "Guardar Registro";
        btnGuardar.classList.remove("modo-edicion");
    }
    window.idEditando = null;
}

/* ============================================================
   CARGAR SOLICITANTES
   ============================================================ */

async function cargarSolicitantes() {
    try {
        const res = await fetch("http://localhost:8080/apiSolicitante/getAllSolicitantes?page=0&size=50");
        const data = await res.json();

        if (asignadoAdd) {
            asignadoAdd.innerHTML = `<option value="">Seleccione solicitante</option>`;

            if (data.content) {
                data.content.forEach(s => {
                    asignadoAdd.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
                });
            }
        }

    } catch (error) {
        console.error("Error cargando solicitantes:", error);
    }
}

if (origenAdd) {
    origenAdd.value = "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";
    origenAdd.readOnly = true;
}

if (cantidadAdd) {
    cantidadAdd.addEventListener("input", () => {
        if (cantidadAdd.value < 1) cantidadAdd.value = 1;
    });
}

/* ============================================================
   CARGAR EDICIÓN
   ============================================================ */

function cargarFormularioEdicion(item) {
    window.idEditando = item.id;

    if (marcaAdd) marcaAdd.value = item.marca;
    if (marcaInsumoAdd) marcaInsumoAdd.value = item.marca;

    if (modeloAdd) modeloAdd.innerHTML = `<option value="${item.modelo}">${item.modelo}</option>`;
    if (insumoAdd) insumoAdd.innerHTML = `<option value="${item.insumo}">${item.insumo}</option>`;

    if (serieAdd) serieAdd.value = item.serie;
    if (inventarioAdd) inventarioAdd.value = item.inventario;

    if (asignadoAdd) {
        [...asignadoAdd.options].forEach(opt => {
            if (opt.text === item.nombre_solicitante) opt.selected = true;
        });
    }

    if (instaladoAdd) instaladoAdd.value = item.instalado_en || "";
    if (descripcionAdd) descripcionAdd.value = item.descripcion || "";
    if (cantidadAdd) cantidadAdd.value = item.cantidad || 1;
    if (estadoAdd) estadoAdd.value = item.estado || "";
    if (origenAdd) origenAdd.value = item.origen || "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";

    if (btnGuardar) {
        btnGuardar.textContent = "Actualizar Registro";
        btnGuardar.classList.add("modo-edicion");
    }
}

/* ============================================================
   ELIMINAR
   ============================================================ */

async function eliminarEquipo(id, filaHTML) {
    Swal.fire({
        title: "¿Eliminar registro?",
        text: "Esto no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then(async (result) => {
        if (result.isConfirmed) {
            const res = await service.deleteEquipo(id);

            if (res.status === "Completado") {
                // Eliminar también el estado guardado
                const estados = JSON.parse(localStorage.getItem("estadosEquipos") || "{}");
                delete estados[id];
                localStorage.setItem("estadosEquipos", JSON.stringify(estados));
                
                filaHTML.style.transition = "0.3s";
                filaHTML.style.opacity = "0";
                setTimeout(() => filaHTML.remove(), 300);
                Swal.fire({ icon: "success", title: "Eliminado", timer: 1800, showConfirmButton: false });
            } else {
                Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar" });
            }
        }
    });
}