// JS/Controllers/InventarioController.js
import { EquipoService } from "../Services/InventarioService.js";
import { InventarioInsumoService } from "../Services/InventarioInsumoService.js";

const service = new EquipoService();

// -------------------------
// DOM references
// -------------------------
const tbody = document.getElementById("tbody-inventario");
const modalEl = document.getElementById("verModal");
const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

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

const btnGuardar = document.querySelector(".btn-guardar");

const marcaAdd = document.getElementById("marcaAdd");
const marcaInsumoAdd = document.getElementById("marcaInsumoAdd");
const modeloAdd = document.getElementById("modeloAdd");
const insumoAdd = document.getElementById("insumoAdd");
const serieAdd = document.getElementById("serieAdd");
const inventarioAdd = document.getElementById("inventarioAdd");
const asignadoAdd = document.getElementById("asignadoAdd");
const instaladoAdd = document.getElementById("instaladoAdd");
const descripcionAdd = document.getElementById("descripcionAdd");
const cantidadAdd = document.getElementById("cantidadAdd");
const estadoAdd = document.getElementById("estadoAdd");
const origenAdd = document.getElementById("origenAdd");

const pageSizeSelect = document.getElementById("pageSize");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const filtroEstado = document.getElementById("filtro-estado");

let idEditando = null;
let currentPage = 0;
let pageSize = Number(pageSizeSelect?.value || 10);
let totalPages = 0;

// -------------------------
// Helpers
// -------------------------
function safeAddListener(el, evt, fn) { if (!el) return; el.addEventListener(evt, fn); }
function setLoadingRow(message = "Cargando...") { if (!tbody) return; tbody.innerHTML = `<tr><td colspan="8" class="text-center">${message}</td></tr>`; }
function typeToConsole(t) { return t === "error" ? "error" : "log"; }
function showToast(tipo = "info", title = "", text = "") {
    if (typeof Swal !== "undefined") {
        if (tipo === "success") Swal.fire(title || "OK", text, "success");
        else if (tipo === "error") Swal.fire(title || "Error", text, "error");
        else Swal.fire(title || "", text, "info");
    } else { console[typeToConsole(tipo)](`${title} ${text}`); }
}
function escapeHtml(text = "") {
    if (text === null || text === undefined) return "";
    return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function debounce(fn, delay = 250) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; }

// -------------------------
// Inicialización
// -------------------------
document.addEventListener("DOMContentLoaded", () => {

    safeAddListener(pageSizeSelect, "change", (e) => {
        pageSize = Number(e.target.value) || 10;
        currentPage = 0;
        cargarInventario();
    });

    safeAddListener(prevPageBtn, "click", () => { if (currentPage > 0) { currentPage--; cargarInventario(); } });
    safeAddListener(nextPageBtn, "click", () => { if (currentPage < totalPages - 1) { currentPage++; cargarInventario(); } });
    safeAddListener(filtroEstado, "change", filtrarFilasPorEstado);

    cargarInventario();
    cargarSolicitantes();
    cargarMarcas();

    if (estadoAdd) estadoAdd.innerHTML = `<option value="pendiente" selected>Pendiente</option><option value="entregado">Entregado</option>`;
    if (origenAdd) origenAdd.value = "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";

    safeAddListener(btnGuardar, "click", async (ev) => { ev.preventDefault(); await handleGuardar(); });
    if (tbody) { tbody.addEventListener("click", tableClickHandler); tbody.addEventListener("change", tableChangeHandler); }
    safeAddListener(marcaAdd, "change", debounce(filtrarInsumosPorMarca, 200));
});

// -------------------------
// Cargar inventario
// -------------------------
async function cargarInventario() {
    try {
        setLoadingRow();
        const pageObj = await service.getAllEquipos(currentPage, pageSize);
        const contenido = Array.isArray(pageObj.content) ? pageObj.content : [];
        totalPages = Number(pageObj.totalPages ?? 0);

        if (!contenido.length) { tbody.innerHTML = `<tr><td colspan="8" class="text-center">No hay registros</td></tr>`; actualizarPaginaInfo(); actualizarBotonesPaginacion(); return; }

        tbody.innerHTML = "";
        const idInicio = currentPage * pageSize + 1;
        contenido.forEach((item, idx) => crearFila(item, idInicio + idx));
        actualizarPaginaInfo(contenido.length);
        actualizarBotonesPaginacion();

    } catch (err) {
        console.error("Error al obtener inventarios", err);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar</td></tr>`;
    }
}
function actualizarPaginaInfo(regCount = 0) { if (!pageInfo) return; pageInfo.textContent = `Página ${currentPage + 1} de ${Math.max(1, totalPages)} — Registros en página: ${regCount}`; }
function actualizarBotonesPaginacion() { if (prevPageBtn) prevPageBtn.disabled = currentPage <= 0; if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages - 1; }

// -------------------------
// Crear fila
// -------------------------
function crearFila(item = {}, idVirtual = "") {
    if (!tbody) return;
    const tr = document.createElement("tr");
    const estadoGuardado = item.estado || "pendiente";

    tr.classList.toggle("estado-entregado", estadoGuardado === "entregado");
    tr.classList.toggle("estado-pendiente", estadoGuardado !== "entregado");

    const nombreSolicitante = item.nombre_solicitante || "Sin asignar";
    const instalado = item.instalado_en || "Sin ubicación";

    tr.innerHTML = `
        <td class="text-center id-virtual">${escapeHtml(idVirtual)}</td>
        <td>${escapeHtml(item.marca)}</td>
        <td>${escapeHtml(item.modelo)}</td>
        <td>${escapeHtml(item.serie)}</td>
        <td>${escapeHtml(item.inventario)}</td>
        <td>${escapeHtml(nombreSolicitante)}</td>
        <td>${escapeHtml(instalado)}</td>
        <td>
            <i class="fa-solid fa-pen-to-square text-primary me-2 btn-editar" data-id="${item.id}" style="cursor:pointer;" title="Editar"></i>
            <i class="fa-solid fa-trash text-danger me-2 btn-eliminar" data-id="${item.id}" style="cursor:pointer;" title="Eliminar"></i>
            <i class="fa-solid fa-eye text-secondary me-2 ver-detalle" data-id="${item.id}" style="cursor:pointer;" title="Ver"></i>
            <select class="estado-select form-select form-select-sm" style="width:auto; display:inline-block; margin-left:8px;" data-id="${item.id}">
                <option value="pendiente" ${estadoGuardado === "pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="entregado" ${estadoGuardado === "entregado" ? "selected" : ""}>Entregado</option>
            </select>
        </td>
    `;

    try { tr.dataset.item = JSON.stringify(item); } catch (e) { }
    tbody.appendChild(tr);
}

// -------------------------
// Eventos delegados
// -------------------------
function tableClickHandler(ev) {
    const el = ev.target;
    if (!el) return;

    const editar = el.closest(".btn-editar");
    if (editar) { handleEditarByRow(editar.closest("tr")); return; }

    const eliminar = el.closest(".btn-eliminar");
    if (eliminar) { handleEliminarByRow(eliminar.closest("tr"), eliminar.dataset.id); return; }

    const ver = el.closest(".ver-detalle");
    if (ver) { const tr = ver.closest("tr"); const item = obtenerItemDesdeFila(tr); if (item) abrirModalDetalle(item); return; }
}
function tableChangeHandler(ev) {
    const el = ev.target;
    if (!el) return;
    if (el.classList.contains("estado-select")) {
        const tr = el.closest("tr");
        const item = obtenerItemDesdeFila(tr);
        if (!item) return;
        handleEstadoChange(item, el);
    }
}

// -------------------------
// Obtener item desde fila
// -------------------------
function obtenerItemDesdeFila(tr) {
    if (!tr) return null;
    try { if (tr.dataset?.item) return JSON.parse(tr.dataset.item); } catch {}
    const cells = tr.querySelectorAll("td");
    if (!cells || cells.length < 7) return null;
    return {
        id: tr.querySelector(".btn-editar")?.dataset.id,
        marca: cells[1]?.textContent?.trim(),
        modelo: cells[2]?.textContent?.trim(),
        serie: cells[3]?.textContent?.trim(),
        inventario: cells[4]?.textContent?.trim(),
        nombre_solicitante: cells[5]?.textContent?.trim(),
        instalado_en: cells[6]?.textContent?.trim(),
        estado: tr.querySelector(".estado-select")?.value
    };
}

// -------------------------
// Cambiar estado y stock
// -------------------------
async function handleEstadoChange(item, selectEl) {
    const nuevo = selectEl.value;
    const previo = selectEl.dataset.prev || item.estado || "pendiente";
    if (nuevo === previo) return;

    selectEl.disabled = true;
    try {
        await actualizarStockSeguro(item, previo, nuevo);
        const payload = { ...item, estado: nuevo };
        const res = await service.updateEquipo(item.id, payload);
        if (res?.status === "Error" || res?.error) throw new Error(res.message || "Error backend");
        selectEl.dataset.prev = nuevo;
        const tr = selectEl.closest("tr");
        if (tr) { tr.classList.toggle("estado-entregado", nuevo === "entregado"); tr.classList.toggle("estado-pendiente", nuevo !== "entregado"); }
        showToast("success", "Estado actualizado", "");
    } catch (err) {
        console.error("Error actualizando estado:", err);
        showToast("error", "No se pudo actualizar el estado", err?.message || "");
        selectEl.value = previo;
    } finally { selectEl.disabled = false; }
}
async function actualizarStockSeguro(item, previo, nuevo) {
    try {
        const insumosResp = await InventarioInsumoService.listar("", 0, 2000);
        const insumos = Array.isArray(insumosResp) ? insumosResp : (insumosResp?.content || []);
        const encontrado = insumos.find(i => i.nombre === item.insumo && i.marca === item.marca && i.descripcion === item.descripcion);
        if (!encontrado) return;

        let nuevaCantidad = Number(encontrado.cantidad ?? 0);
        const delta = Number(item.cantidad ?? 1);

        if (previo !== "entregado" && nuevo === "entregado") nuevaCantidad -= delta;
        if (previo === "entregado" && nuevo !== "entregado") nuevaCantidad += delta;

        nuevaCantidad = Math.max(0, nuevaCantidad);
        await InventarioInsumoService.actualizarCantidad(encontrado.id, nuevaCantidad);
    } catch (err) { console.error("Error manejando stock:", err); }
}

// -------------------------
// Modal detalle
// -------------------------
function abrirModalDetalle(item) {
    if (!modal) return;
    if (detalleMarca) detalleMarca.textContent = item.marca || "N/A";
    if (detalleModelo) detalleModelo.textContent = item.modelo || "N/A";
    if (detalleSerie) detalleSerie.textContent = item.serie || "N/A";
    if (detalleInventario) detalleInventario.textContent = item.inventario || "N/A";
    if (detalleAsignado) detalleAsignado.textContent = item.nombre_solicitante || "Sin asignar";
    if (detalleInstalado) detalleInstalado.textContent = item.instalado_en || "Sin ubicación";
    if (detalleInsumo) detalleInsumo.textContent = item.insumo || "N/A";
    if (detalleMarcaInsumo) detalleMarcaInsumo.textContent = item.marca || "N/A";
    if (detalleDescripcion) detalleDescripcion.textContent = item.descripcion || "N/A";
    if (detallePresentacion) detallePresentacion.textContent = item.presentacion_ml ?? "N/A";
    if (detalleEstado) detalleEstado.textContent = (item.estado || "Pendiente");
    if (detalleOrigen) detalleOrigen.textContent = item.origen || "";
    modal.show();
}

// -------------------------
// Cargar solicitantes
// -------------------------
async function cargarSolicitantes() {
    try {
        const res = await fetch("http://localhost:8080/apiSolicitante/getAllSolicitantes?page=0&size=50");
        if (!res.ok) throw new Error("No se pudo obtener solicitantes");
        const data = await res.json();
        const lista = data?.content || [];
        if (!asignadoAdd) return;
        asignadoAdd.innerHTML = `<option value="">Seleccione solicitante</option>`;
        lista.forEach(s => { const opt = document.createElement("option"); opt.value = s.id ?? ""; opt.text = s.nombre ?? "(sin nombre)"; asignadoAdd.appendChild(opt); });
    } catch (err) { console.error("Error cargando solicitantes:", err); if (asignadoAdd) asignadoAdd.innerHTML = `<option value="">No hay solicitantes</option>`; }
}

// -------------------------
// Cargar marcas e insumos
// -------------------------
async function cargarMarcas() {
    try {
        const respuesta = await InventarioInsumoService.listar("", 0, 2000);
        const insumos = Array.isArray(respuesta) ? respuesta : (respuesta?.content || []);
        const marcas = [...new Set(insumos.map(i => i.marca).filter(Boolean))].sort();

        if (marcaAdd) { marcaAdd.innerHTML = `<option value="">Seleccione marca</option>`; marcas.forEach(m => { const opt = document.createElement("option"); opt.value = m; opt.text = m; marcaAdd.appendChild(opt); }); }
        if (marcaInsumoAdd) { marcaInsumoAdd.innerHTML = `<option value="">Seleccione marca</option>`; marcas.forEach(m => { const opt = document.createElement("option"); opt.value = m; opt.text = m; marcaInsumoAdd.appendChild(opt); }); }
    } catch (err) { console.error("Error cargar marcas:", err); }
}

// -------------------------
// Filtrar insumos por marca
// -------------------------
async function filtrarInsumosPorMarca() {
    if (!marcaAdd || !insumoAdd) return;
    const marca = marcaAdd.value;
    marcaInsumoAdd.value = marca;
    insumoAdd.innerHTML = `<option value="">Cargando...</option>`;
    if (!marca) { insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`; return; }

    try {
        const respuesta = await InventarioInsumoService.listar("", 0, 2000);
        const insumos = Array.isArray(respuesta) ? respuesta : (respuesta?.content || []);
        const filtrados = insumos.filter(i => i.marca === marca);
        const nombres = [...new Set(filtrados.map(i => i.nombre).filter(Boolean))].sort();
        insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;
        nombres.forEach(n => { const opt = document.createElement("option"); opt.value = n; opt.text = n; insumoAdd.appendChild(opt); });
    } catch (err) { console.error("Error filtrando insumos", err); insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`; }
}

async function handleGuardar() {
    if (!btnGuardar) return;

    // validaciones frontales
    const errores = validarFormulario();
    if (errores.length) {
        showToast("error", "Campos inválidos", errores.join("\n"));
        return;
    }

    const equipoData = construirPayloadDesdeForm();

    try {
        btnGuardar.disabled = true;

        if (idEditando) {
            console.log("Editando ID:", idEditando, "Payload:", equipoData);

            // ✅ Verificar primero si el equipo existe
            const existente = await service.getEquipoById(idEditando);
            if (existente?.status === "Error") {
                showToast("error", "No se puede editar", "El equipo no existe");
                idEditando = null;
                return;
            }

            const res = await service.updateEquipo(idEditando, equipoData);

            if (res?.status === "Error" || res?.error) {
                throw new Error(res.message || "Error al actualizar");
            }

            showToast("success", "Registro actualizado", "");
        } else {
            const res = await service.crearEquipo(equipoData);
            if (res?.status === "Error" || res?.error) throw new Error(res.message || "Error al crear");
            showToast("success", "Registro guardado", "");
        }

        limpiarFormulario();
        idEditando = null;
        await cargarInventario();

    } catch (err) {
        console.error("Error guardando:", err);
        showToast("error", "No se pudo guardar", err?.message || "");
    } finally {
        btnGuardar.disabled = false;
    }
}

// -------------------------
// Validaciones
// -------------------------
function validarFormulario() {
    const errores = [];
    if (!marcaAdd?.value) errores.push("Debe seleccionar una marca");
    if (!modeloAdd?.value) errores.push("Debe ingresar un modelo");
    if (!insumoAdd?.value) errores.push("Debe seleccionar un insumo");
    if (!cantidadAdd?.value || Number(cantidadAdd.value) <= 0) errores.push("Cantidad inválida");
    if (!estadoAdd?.value) errores.push("Debe seleccionar un estado");
    return errores;
}

// -------------------------
// Construir payload
// -------------------------
function construirPayloadDesdeForm() {
    return {
        marca: marcaAdd?.value || "",
        modelo: modeloAdd?.value || "",
        serie: serieAdd?.value || "",
        inventario: inventarioAdd?.value || "",
        nombre_solicitante: asignadoAdd?.value || "",
        instalado_en: instaladoAdd?.value || "",
        insumo: insumoAdd?.value || "",
        descripcion: descripcionAdd?.value || "",
        cantidad: Number(cantidadAdd?.value || 1),
        estado: estadoAdd?.value || "pendiente",
        origen: origenAdd?.value || ""
    };
}

// -------------------------
// Editar desde fila
// -------------------------
function handleEditarByRow(tr) {
    const item = obtenerItemDesdeFila(tr);
    if (!item) return;
    idEditando = item.id;
    if (marcaAdd) marcaAdd.value = item.marca || "";
    if (modeloAdd) modeloAdd.value = item.modelo || "";
    if (serieAdd) serieAdd.value = item.serie || "";
    if (inventarioAdd) inventarioAdd.value = item.inventario || "";
    if (asignadoAdd) asignadoAdd.value = item.nombre_solicitante || "";
    if (instaladoAdd) instaladoAdd.value = item.instalado_en || "";
    if (insumoAdd) insumoAdd.value = item.insumo || "";
    if (descripcionAdd) descripcionAdd.value = item.descripcion || "";
    if (cantidadAdd) cantidadAdd.value = item.cantidad || 1;
    if (estadoAdd) estadoAdd.value = item.estado || "pendiente";
    if (origenAdd) origenAdd.value = item.origen || "";
}

// -------------------------
// Eliminar desde fila
// -------------------------
async function handleEliminarByRow(tr, id) {
    if (!id) return;
    const confirm = await Swal.fire({ title: "Confirmar eliminación", text: "¿Desea eliminar este registro?", icon: "warning", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" });
    if (!confirm.isConfirmed) return;

    try {
        const res = await service.deleteEquipo(id);
        if (res?.status === "Error" || res?.error) throw new Error(res.message || "No se pudo eliminar");
        tr?.remove();
        showToast("success", "Registro eliminado", "");
    } catch (err) {
        console.error(err);
        showToast("error", "No se pudo eliminar", err?.message || "");
    }
}

// -------------------------
// Filtrar tabla por estado
// -------------------------
function filtrarFilasPorEstado() {
    if (!filtroEstado || !tbody) return;
    const val = filtroEstado.value;
    const filas = tbody.querySelectorAll("tr");
    filas.forEach(tr => {
        const estado = tr.querySelector(".estado-select")?.value || "pendiente";
        tr.style.display = val === "" || estado === val ? "" : "none";
    });
}
