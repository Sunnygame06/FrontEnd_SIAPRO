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

            <select class="estado-select form-select form-select-sm" style="width:auto;">
                <option value="pendiente">Pendiente</option>
                <option value="entregado">Entregado</option>
            </select>
        </td>
    `;

    tbody.appendChild(tr);

    tr.querySelector(".ver-detalle").addEventListener("click", () => abrirModalDetalle(item));
    tr.querySelector(".btn-editar").addEventListener("click", () => cargarFormularioEdicion(item));
    tr.querySelector(".btn-eliminar").addEventListener("click", (e) => eliminarEquipo(e.target.dataset.id, tr));

    const selectEstado = tr.querySelector(".estado-select");
    selectEstado.addEventListener("change", () => aplicarColorFila(tr, selectEstado.value));

    aplicarColorFila(tr, "pendiente");
}

// ======================================================
// Modal Detalles (OJO)
// ======================================================
function abrirModalDetalle(item) {

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
    detalleEstado.textContent = item.estado || "N/A";
    detalleOrigen.textContent = item.origen || "N/A";

    modal.show();
}

// ======================================================
// Colores por estado
// ======================================================
function aplicarColorFila(fila, estado) {
    fila.classList.remove("estado-pendiente", "estado-entregado");
    fila.classList.add(estado === "entregado" ? "estado-entregado" : "estado-pendiente");
}

// ======================================================
// Filtro
// ======================================================
const filtroEstado = document.getElementById("filtro-estado");
filtroEstado.addEventListener("change", () => filtrarPorEstado(filtroEstado.value));

function filtrarPorEstado(estado) {
    const filas = tbody.querySelectorAll("tr");

    filas.forEach(fila => {
        const estadoFila = fila.querySelector(".estado-select")?.value;
        fila.style.display = (estado === "todos" || estado === estadoFila) ? "" : "none";
    });
}

/* ============================================================
   DEPENDENCIAS EPSON → TINTA → WORKFORCE
   ============================================================ */

const marcaAdd = document.getElementById("marcaAdd");
const marcaInsumoAdd = document.getElementById("marcaInsumoAdd");
const estadoAdd = document.getElementById("estadoAdd");

estadoAdd.innerHTML = `
    <option value="">Seleccione estado</option>
    <option value="Nuevo">Nuevo</option>
    <option value="Semi-nuevo">Semi-nuevo</option>
`;

marcaAdd.addEventListener("change", () => {
    marcaInsumoAdd.value = marcaAdd.value;
    marcaInsumoAdd.readOnly = true;
});

const insumoAdd = document.getElementById("insumoAdd");
const modeloAdd = document.getElementById("modeloAdd");

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

insumoAdd.addEventListener("change", () => {
    modeloAdd.innerHTML =
        insumoAdd.value === "TINTA"
            ? `<option value="">Seleccione modelo</option><option value="WORKFORCE WF-CS810">WORKFORCE WF-CS810</option>`
            : `<option value="">Seleccione modelo</option>`;
});

/* ============================================================
   GUARDAR / ACTUALIZAR
   ============================================================ */

const btnGuardar = document.querySelector(".btn-guardar");
const serieAdd = document.getElementById("serieAdd");
const inventarioAdd = document.getElementById("inventarioAdd");
const asignadoAdd = document.getElementById("asignadoAdd");
const instaladoAdd = document.getElementById("instaladoAdd");

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
        crearFila(resultado.data);
        limpiarFormulario();
    } else {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudo guardar." });
    }
});

function limpiarFormulario() {
    marcaAdd.value = "";
    modeloAdd.innerHTML = `<option value="">Seleccione modelo</option>`;
    insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;
    serieAdd.value = "";
    inventarioAdd.value = "";
    asignadoAdd.value = "";
    instaladoAdd.value = "";
    descripcionAdd.value = "";
    cantidadAdd.value = 1;
    estadoAdd.value = "";
    origenAdd.value = "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";
    btnGuardar.textContent = "Guardar Registro";
    btnGuardar.classList.remove("modo-edicion");
    window.idEditando = null;
}

/* ============================================================
   CARGAR SOLICITANTES
   ============================================================ */

async function cargarSolicitantes() {
    try {
        const res = await fetch("http://localhost:8080/apiSolicitante/getAllSolicitantes?page=0&size=50");
        const data = await res.json();

        asignadoAdd.innerHTML = `<option value="">Seleccione solicitante</option>`;

        data.content.forEach(s => {
            asignadoAdd.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
        });

    } catch (error) {
        console.error("Error cargando solicitantes:", error);
    }
}

const origenAdd = document.getElementById("origenAdd");
origenAdd.value = "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";
origenAdd.readOnly = true;

const cantidadAdd = document.getElementById("cantidadAdd");
cantidadAdd.addEventListener("input", () => {
    if (cantidadAdd.value < 1) cantidadAdd.value = 1;
});

/* ============================================================
   CARGAR EDICIÓN
   ============================================================ */

function cargarFormularioEdicion(item) {

    window.idEditando = item.id;

    marcaAdd.value = item.marca;
    marcaInsumoAdd.value = item.marca;

    modeloAdd.innerHTML = `<option value="${item.modelo}">${item.modelo}</option>`;
    insumoAdd.innerHTML = `<option value="${item.insumo}">${item.insumo}</option>`;

    serieAdd.value = item.serie;
    inventarioAdd.value = item.inventario;

    [...asignadoAdd.options].forEach(opt => {
        if (opt.text === item.nombre_solicitante) opt.selected = true;
    });

    instaladoAdd.value = item.instalado_en || "";

    descripcionAdd.value = item.descripcion || "";
    cantidadAdd.value = item.cantidad || 1;
    estadoAdd.value = item.estado || "";
    origenAdd.value = item.origen || "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";

    btnGuardar.textContent = "Actualizar Registro";
    btnGuardar.classList.add("modo-edicion");
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
