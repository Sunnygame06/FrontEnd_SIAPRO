// ======================================================
//  InventarioController.js COMPLETO + FUNCIONAL
// ======================================================

import { EquipoService } from "../Services/InventarioService.js";
import { InventarioInsumoService } from "../Services/InventarioInsumoService.js";

const service = new EquipoService();

// DOM
const tbody = document.getElementById("tbody-inventario");
const modal = new bootstrap.Modal(document.getElementById("verModal"));

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

let idEditando = null;

// paginación
let currentPage = 0;
let pageSize = Number(pageSizeSelect?.value || 10);
let totalPages = 0;

// ======================================================
// Init
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    pageSizeSelect?.addEventListener("change", (e) => {
        pageSize = Number(e.target.value);
        currentPage = 0;
        cargarInventario();
    });

    prevPageBtn?.addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            cargarInventario();
        }
    });

    nextPageBtn?.addEventListener("click", () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            cargarInventario();
        }
    });

    cargarInventario();
    cargarSolicitantes();
    cargarMarcas();

    estadoAdd.innerHTML = `
        <option value="pendiente" selected>Pendiente</option>
        <option value="entregado">Entregado</option>
    `;

    origenAdd.value = "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";
});

// ======================================================
// Cargar inventario
// ======================================================
async function cargarInventario() {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Cargando...</td></tr>`;
    try {
        const pageObj = await service.getAllEquipos(currentPage, pageSize);
        const contenido = pageObj?.content || [];
        totalPages = pageObj?.totalPages ?? 0;

        if (!contenido.length) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">No hay registros</td></tr>`;
            pageInfo.textContent = `Página ${currentPage + 1} de ${Math.max(1, totalPages)}`;
            actualizarBotonesPaginacion();
            return;
        }

        tbody.innerHTML = "";
        const idInicio = currentPage * pageSize + 1;
        contenido.forEach((item, idx) => crearFila(item, idInicio + idx));

        pageInfo.textContent = `Página ${currentPage + 1} de ${Math.max(1, totalPages)} — Registros: ${contenido.length}`;
        actualizarBotonesPaginacion();

    } catch (err) {
        console.error("Error al obtener inventarios", err);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar</td></tr>`;
    }
}

function actualizarBotonesPaginacion() {
    prevPageBtn.disabled = currentPage <= 0;
    nextPageBtn.disabled = currentPage >= totalPages - 1;
}

// ======================================================
// Crear fila
// ======================================================
function crearFila(item, idVirtual) {
    const tr = document.createElement("tr");
    const estadoGuardado = item.estado || "pendiente";

    tr.classList.toggle("estado-entregado", estadoGuardado === "entregado");
    tr.classList.toggle("estado-pendiente", estadoGuardado !== "entregado");

    tr.innerHTML = `
        <td class="text-center id-virtual">${idVirtual}</td>
        <td>${item.marca || ""}</td>
        <td>${item.modelo || ""}</td>
        <td>${item.serie || ""}</td>
        <td>${item.inventario || ""}</td>
        <td>${item.nombre_solicitante || "Sin asignar"}</td>
        <td>${item.instalado_en || "Sin ubicación"}</td>
        <td>
            <i class="fa-solid fa-pen-to-square text-primary me-2 btn-editar" data-id="${item.id}" style="cursor:pointer;"></i>
            <i class="fa-solid fa-trash text-danger me-2 btn-eliminar" data-id="${item.id}" style="cursor:pointer;"></i>
            <i class="fa-solid fa-eye text-secondary me-2 ver-detalle" style="cursor:pointer;"></i>

            <select class="estado-select form-select form-select-sm" style="width:auto; display:inline-block; margin-left:8px;" data-id="${item.id}">
                <option value="pendiente" ${estadoGuardado === "pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="entregado" ${estadoGuardado === "entregado" ? "selected" : ""}>Entregado</option>
            </select>
        </td>
    `;

    tbody.appendChild(tr);

    tr.querySelector(".ver-detalle").addEventListener("click", () => abrirModalDetalle(item));
    tr.querySelector(".btn-editar").addEventListener("click", () => cargarFormularioEdicion(item));
    tr.querySelector(".btn-eliminar").addEventListener("click", () => eliminarEquipo(item.id, tr));

    const estadoSelect = tr.querySelector(".estado-select");
    estadoSelect.dataset.prev = estadoGuardado;

    estadoSelect.addEventListener("change", async (ev) => {
        const nuevo = ev.target.value;
        const previo = ev.target.dataset.prev;
        if (nuevo === previo) return;

        const backupValue = previo;

        try {
            await actualizarStockSeguro(item, previo, nuevo);
            await service.updateEquipo(item.id, { ...item, estado: nuevo });

            tr.classList.toggle("estado-entregado", nuevo === "entregado");
            tr.classList.toggle("estado-pendiente", nuevo !== "entregado");

            ev.target.dataset.prev = nuevo;
            Swal.fire("Éxito", "Estado actualizado", "success");

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "No se pudo actualizar el estado", "error");
            ev.target.value = backupValue;
        }
    });
}

// ======================================================
// Manejo SEGURO del stock
// ======================================================
async function actualizarStockSeguro(item, previo, nuevo) {
    try {
        const insumos = await InventarioInsumoService.listar("", 0, 2000);
        const lista = Array.isArray(insumos) ? insumos : insumos.content || [];

        const encontrado = lista.find(i =>
            i.nombre === item.insumo &&
            i.marca === item.marca &&
            i.descripcion === item.descripcion
        );

        if (!encontrado) return;

        let nuevaCantidad = encontrado.cantidad;

        if (previo !== "entregado" && nuevo === "entregado") {
            nuevaCantidad -= (item.cantidad || 1);
        }
        if (previo === "entregado" && nuevo !== "entregado") {
            nuevaCantidad += (item.cantidad || 1);
        }

        await InventarioInsumoService.actualizarCantidad(encontrado.id, Math.max(0, nuevaCantidad));

    } catch (err) {
        console.error("Error manejando stock:", err);
    }
}

// ======================================================
// Modal detalle
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
    detalleEstado.textContent = item.estado || "Pendiente";
    detalleOrigen.textContent = item.origen || "";

    modal.show();
}

// ======================================================
// Filtro estado
// ======================================================
document.getElementById("filtro-estado").addEventListener("change", (e) => {
    const valor = e.target.value;
    tbody.querySelectorAll("tr").forEach(fila => {
        const estado = fila.querySelector(".estado-select")?.value;
        fila.style.display = valor === "todos" || valor === estado ? "" : "none";
    });
});

// ======================================================
// cargar solicitantes
// ======================================================
async function cargarSolicitantes() {
    try {
        const res = await fetch("http://localhost:8080/apiSolicitante/getAllSolicitantes?page=0&size=200");
        const data = await res.json();
        asignadoAdd.innerHTML = `<option value="">Seleccione solicitante</option>`;
        (data.content || []).forEach(s => asignadoAdd.innerHTML += `<option value="${s.id}">${s.nombre}</option>`);
    } catch {
        asignadoAdd.innerHTML = `<option value="">No hay solicitantes</option>`;
    }
}

// ======================================================
// cargar marcas / insumos
// ======================================================
async function cargarMarcas() {
    try {
        const respuesta = await InventarioInsumoService.listar("", 0, 2000);
        const insumos = Array.isArray(respuesta) ? respuesta : respuesta.content || [];

        const marcas = [...new Set(insumos.map(i => i.marca).filter(Boolean))];

        marcaAdd.innerHTML = `<option value="">Seleccione marca</option>`;
        marcaInsumoAdd.innerHTML = `<option value="">Seleccione marca</option>`;
        marcas.forEach(m => {
            marcaAdd.innerHTML += `<option value="${m}">${m}</option>`;
            marcaInsumoAdd.innerHTML += `<option value="${m}">${m}</option>`;
        });
    } catch (err) {
        console.error("Error cargar marcas:", err);
    }
}

// ======================================================
// filtrar insumos por marca
// ======================================================
marcaAdd.addEventListener("change", async () => {
    const marca = marcaAdd.value;
    marcaInsumoAdd.value = marca;
    insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;

    if (!marca) return;

    try {
        const respuesta = await InventarioInsumoService.listar("", 0, 2000);
        const insumos = Array.isArray(respuesta) ? respuesta : respuesta.content || [];
        const filtrados = insumos.filter(i => i.marca === marca);
        const nombres = [...new Set(filtrados.map(i => i.nombre))];
        nombres.forEach(n => insumoAdd.innerHTML += `<option value="${n}">${n}</option>`);
    } catch (err) {
        console.error("Error filtrando insumos", err);
    }
});

// ======================================================
// guardar / actualizar
// ======================================================
btnGuardar.addEventListener("click", async () => {
    if (!marcaAdd.value || !modeloAdd.value || !inventarioAdd.value || !insumoAdd.value) {
        return Swal.fire("Error", "Complete los campos obligatorios", "error");
    }

    const equipoData = {
        marca: marcaAdd.value,
        modelo: modeloAdd.value,
        serie: serieAdd.value,
        inventario: inventarioAdd.value,
        solicitante_id: asignadoAdd.value || null,
        nombre_solicitante: asignadoAdd.options[asignadoAdd.selectedIndex]?.text || "",
        instalado_en: instaladoAdd.value,
        insumo: insumoAdd.value,
        descripcion: descripcionAdd.value,
        cantidad: Number(cantidadAdd.value || 1),
        estado: estadoAdd.value,
        origen: origenAdd.value
    };

    try {
        if (idEditando) {
            await service.updateEquipo(idEditando, equipoData);
            Swal.fire("Éxito", "Registro actualizado", "success");
        } else {
            await service.crearEquipo(equipoData);
            Swal.fire("Éxito", "Registro guardado", "success");
        }

        limpiarFormulario();
        cargarInventario();
        idEditando = null;

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo guardar", "error");
    }
});

// ======================================================
// editar
// ======================================================
async function cargarFormularioEdicion(item) {
    idEditando = item.id;

    marcaAdd.value = item.marca || "";

    // Recargar insumos según marca y luego seleccionar el correcto
    await recargarInsumosPorMarca(item.marca, item.insumo);

    modeloAdd.value = item.modelo || "";
    serieAdd.value = item.serie || "";
    inventarioAdd.value = item.inventario || "";
    instaladoAdd.value = item.instalado_en || "";
    descripcionAdd.value = item.descripcion || "";
    cantidadAdd.value = item.cantidad || 1;
    estadoAdd.value = item.estado || "pendiente";
    origenAdd.value = item.origen || "";
    asignadoAdd.value = item.solicitante_id || "";
}

// ======================================================
// recargar insumos por marca (editar)
// ======================================================
async function recargarInsumosPorMarca(marca, insumoSeleccionado) {
    marcaInsumoAdd.value = marca;
    insumoAdd.innerHTML = `<option value="">Cargando...</option>`;

    try {
        const respuesta = await InventarioInsumoService.listar("", 0, 2000);
        const insumos = Array.isArray(respuesta) ? respuesta : respuesta.content || [];
        const filtrados = insumos.filter(i => i.marca === marca);
        const nombres = [...new Set(filtrados.map(i => i.nombre))];
        insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;
        nombres.forEach(n => {
            insumoAdd.innerHTML += `<option value="${n}" ${n === insumoSeleccionado ? "selected" : ""}>${n}</option>`;
        });
    } catch (err) {
        console.error("Error recargando insumos para edición", err);
        insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;
    }
}

// ======================================================
// eliminar
// ======================================================
async function eliminarEquipo(id, fila) {
    const r = await Swal.fire({ title: "¿Eliminar?", showCancelButton: true });
    if (!r.isConfirmed) return;

    try {
        await service.deleteEquipo(id);
        fila.remove();
        cargarInventario();
        Swal.fire("Eliminado", "Registro eliminado", "success");
    } catch {
        Swal.fire("Error", "No se pudo eliminar", "error");
    }
}

// ======================================================
// limpiar form
// ======================================================
function limpiarFormulario() {
    marcaAdd.value = "";
    marcaInsumoAdd.value = "";
    modeloAdd.value = "";
    insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;
    serieAdd.value = "";
    inventarioAdd.value = "";
    asignadoAdd.value = "";
    instaladoAdd.value = "";
    descripcionAdd.value = "";
    cantidadAdd.value = 1;
    estadoAdd.value = "pendiente";
    origenAdd.value = "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";
    idEditando = null;
}
