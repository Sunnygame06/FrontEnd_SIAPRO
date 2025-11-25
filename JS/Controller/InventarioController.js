import { EquipoService } from "../Services/InventarioService.js";
import { InventarioInsumoService } from "../Services/InventarioInsumoService.js"; // se usa directamente, no "new"

const service = new EquipoService();
const tbody = document.getElementById("tbody-inventario");
const modal = new bootstrap.Modal(document.getElementById("verModal"));

// Detalles modal
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

// Inputs formulario
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

// Estados locales
let idEditando = null;

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    cargarInventario();
    cargarSolicitantes();
    cargarMarcas();
    estadoAdd.innerHTML = `<option value="pendiente" selected>Pendiente</option><option value="entregado">Entregado</option>`;
    origenAdd.value = "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";
});

// Cargar inventario
async function cargarInventario() {
    const equipos = await service.getAllEquipos();
    tbody.innerHTML = "";
    if (!equipos || equipos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">No hay registros</td></tr>`;
        return;
    }
    equipos.forEach(item => crearFila(item));
}

// Crear fila
function crearFila(item) {
    const tr = document.createElement("tr");
    const estadoGuardado = item.estado || "pendiente";
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
            <i class="fa-solid fa-eye text-secondary me-2 ver-detalle" data-json='${JSON.stringify(item)}'></i>
            <select class="estado-select form-select form-select-sm" style="width:auto;" data-id="${item.id}">
                <option value="pendiente" ${estadoGuardado === "pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="entregado" ${estadoGuardado === "entregado" ? "selected" : ""}>Entregado</option>
            </select>
        </td>
    `;
    tbody.appendChild(tr);
    aplicarColorFila(tr, estadoGuardado);

    tr.querySelector(".ver-detalle").addEventListener("click", () => abrirModalDetalle(item));
    tr.querySelector(".btn-editar").addEventListener("click", () => cargarFormularioEdicion(item));
    tr.querySelector(".btn-eliminar").addEventListener("click", () => eliminarEquipo(item.id, tr));

    tr.querySelector(".estado-select").addEventListener("change", async (e) => {
        const nuevoEstado = e.target.value;
        item.estado = nuevoEstado;
        await service.updateEquipo(item.id, item); // actualizar estado
        aplicarColorFila(tr, nuevoEstado);
    });
}

// Modal detalle
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
    detalleOrigen.textContent = item.origen || "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES";
    modal.show();
}

// Colorear fila por estado
function aplicarColorFila(fila, estado) {
    fila.classList.remove("estado-pendiente", "estado-entregado");
    if (estado === "entregado") {
        fila.classList.add("estado-entregado");
        fila.style.backgroundColor = "#d4edda";
    } else {
        fila.classList.add("estado-pendiente");
        fila.style.backgroundColor = "#fff3cd";
    }
}

// Filtro por estado
document.getElementById("filtro-estado").addEventListener("change", (e) => {
    const filas = tbody.querySelectorAll("tr");
    filas.forEach(fila => {
        const estadoFila = fila.querySelector(".estado-select").value;
        fila.style.display = e.target.value === "todos" || e.target.value === estadoFila ? "" : "none";
    });
});

// Cargar solicitantes
async function cargarSolicitantes() {
    const res = await fetch("http://localhost:8080/apiSolicitante/getAllSolicitantes?page=0&size=50");
    const data = await res.json();
    asignadoAdd.innerHTML = `<option value="">Seleccione solicitante</option>`;
    (data.content || []).forEach(s => asignadoAdd.innerHTML += `<option value="${s.id}">${s.nombre}</option>`);
}

// Cargar marcas
async function cargarMarcas() {
    const respuesta = await InventarioInsumoService.listar("", 0, 50); // usar directamente
    const insumos = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
    const marcas = [...new Set(insumos.map(i => i.marca).filter(Boolean))].sort();
    marcaAdd.innerHTML = `<option value="">Seleccione marca</option>`;
    marcaInsumoAdd.innerHTML = `<option value="">Seleccione marca</option>`;
    marcas.forEach(m => {
        marcaAdd.innerHTML += `<option value="${m}">${m}</option>`;
        marcaInsumoAdd.innerHTML += `<option value="${m}">${m}</option>`;
    });
}

// Filtrar insumos al cambiar marca
marcaAdd.addEventListener("change", async () => {
    const marca = marcaAdd.value;
    marcaInsumoAdd.value = marca;
    insumoAdd.innerHTML = `<option value="">Seleccione insumo</option>`;
    if (!marca) return;
    const respuesta = await InventarioInsumoService.listar(marca, 0, 50);
    const insumos = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
    const nombresInsumos = [...new Set(insumos.map(i => i.nombre).filter(Boolean))].sort();
    nombresInsumos.forEach(ins => {
        insumoAdd.innerHTML += `<option value="${ins}">${ins}</option>`;
    });
});

// Guardar registro
btnGuardar.addEventListener("click", async () => {
    if (!marcaAdd.value || !modeloAdd.value || !inventarioAdd.value || !insumoAdd.value) {
        Swal.fire("Error", "Complete todos los campos obligatorios", "error");
        return;
    }

    const cantidadSolicitada = parseInt(cantidadAdd.value || 0);
    const insumosDisponibles = await InventarioInsumoService.listar(insumoAdd.value, 0, 50);
    const stockActual = insumosDisponibles[0]?.cantidad || 0;

    if (cantidadSolicitada > stockActual) {
        Swal.fire("Error", `No hay suficiente stock. Disponible: ${stockActual}`, "error");
        return;
    }

    const nuevaCantidad = stockActual - cantidadSolicitada;
    await InventarioInsumoService.actualizarCantidad(insumosDisponibles[0].id, nuevaCantidad);

    const equipoData = {
        marca: marcaAdd.value,
        modelo: modeloAdd.value,
        serie: serieAdd.value,
        inventario: inventarioAdd.value,
        nombre_solicitante: asignadoAdd.options[asignadoAdd.selectedIndex].text,
        instalado_en: instaladoAdd.value,
        insumo: insumoAdd.value,
        descripcion: descripcionAdd.value,
        cantidad: cantidadSolicitada,
        estado: estadoAdd.value || "pendiente",
        origen: origenAdd.value || "UNIDAD DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES"
    };

    if (idEditando) {
        await service.updateEquipo(idEditando, equipoData);
        idEditando = null;
    } else {
        await service.crearEquipo(equipoData);
    }

    Swal.fire("Éxito", "Registro guardado correctamente", "success");
    cargarInventario();
    limpiarFormulario();
});

// Editar
function cargarFormularioEdicion(item) {
    idEditando = item.id;
    marcaAdd.value = item.marca;
    marcaInsumoAdd.value = item.marca;
    modeloAdd.value = item.modelo;
    serieAdd.value = item.serie;
    inventarioAdd.value = item.inventario;
    asignadoAdd.value = item.nombre_solicitante;
    instaladoAdd.value = item.instalado_en;
    insumoAdd.innerHTML = `<option value="${item.insumo}" selected>${item.insumo}</option>`;
    descripcionAdd.value = item.descripcion;
    cantidadAdd.value = item.cantidad;
    estadoAdd.value = item.estado;
    origenAdd.value = item.origen;
}

// Eliminar
async function eliminarEquipo(id, fila) {
    const result = await Swal.fire({
        title: "¿Desea eliminar este registro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });
    if (result.isConfirmed) {
        await service.deleteEquipo(id);
        fila.remove();
        Swal.fire("Eliminado", "Registro eliminado correctamente", "success");
    }
}

// Limpiar formulario
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
}
