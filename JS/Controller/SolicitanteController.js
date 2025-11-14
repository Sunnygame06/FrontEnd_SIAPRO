import { SolicitanteService } from "../Services/SolicitanteService.js";

const addModal = document.getElementById("addModal");
const overlay = document.getElementById("overlay");
const addForm = document.getElementById("addForm");

const unidadAdd = document.getElementById("unidadAdd");
const nombreAdd = document.getElementById("nombreAdd");
const cargoAdd = document.getElementById("cargoAdd");
const correoAdd = document.getElementById("correoAdd");
const telefonoAdd = document.getElementById("telefonoAdd");
const regionAdd = document.getElementById("regionAdd");
const departamentoAdd = document.getElementById("departamentoAdd");
const municipioAdd = document.getElementById("municipioAdd");
const ubicadoAdd = document.getElementById("ubicadoAdd");
const direccionAdd = document.getElementById("direccionAdd");

const tableBody = document.querySelector("#solicitanteTable tbody");

const searchInput = document.getElementById("searchInput");
const filtroDepartamento = document.getElementById("filtroDepartamento");

const API_URL = "http://localhost:8080/apiSolicitante";
const service = new SolicitanteService(API_URL);

let listaSolicitantes = [];

/* ============================================================
   REGIÓN → DEPARTAMENTOS
============================================================ */
const departamentosPorRegion = {
  "Occidente": ["Ahuachapán", "Santa Ana", "Sonsonate"],
  "Central": ["La Libertad", "San Salvador", "Chalatenango", "Cuscatlán"],
  "Paracentral": ["La Paz", "Cabañas", "San Vicente"],
  "Oriente": ["Usulután", "San Miguel", "Morazán", "La Unión"]
};

/* ============================================================
   MUNICIPIOS NUEVOS (SIN DISTRITOS)
============================================================ */
const municipiosPorDepartamento = {
  "Ahuachapán": ["Ahuachapán Norte","Ahuachapán Centro","Ahuachapán Sur"],
  "San Salvador": ["San Salvador Norte","San Salvador Oeste","San Salvador Este","San Salvador Centro","San Salvador Sur"],
  "La Libertad": ["La Libertad Norte","La Libertad Centro","La Libertad Oeste","La Libertad Este","La Libertad Costa","La Libertad Sur"],
  "Chalatenango": ["Chalatenango Norte","Chalatenango Centro","Chalatenango Sur"],
  "Cuscatlán": ["Cuscatlán Norte","Cuscatlán Sur"],
  "Cabañas": ["Cabañas Este","Cabañas Oeste"],
  "La Paz": ["La Paz Oeste","La Paz Centro","La Paz Este"],
  "La Unión": ["La Unión Norte","La Unión Sur"],
  "Usulután": ["Usulután Norte","Usulután Este","Usulután Oeste"],
  "Sonsonate": ["Sonsonate Norte","Sonsonate Centro","Sonsonate Este","Sonsonate Oeste"],
  "Santa Ana": ["Santa Ana Norte","Santa Ana Centro","Santa Ana Este","Santa Ana Oeste"],
  "San Vicente": ["San Vicente Norte","San Vicente Sur"],
  "San Miguel": ["San Miguel Norte","San Miguel Centro","San Miguel Oeste"],
  "Morazán": ["Morazán Norte","Morazán Sur"]
};

/* ============================================================
   CARGAR DEPARTAMENTOS SEGÚN REGIÓN
============================================================ */
regionAdd.addEventListener("change", () => {
  const region = regionAdd.value;

  departamentoAdd.innerHTML = "<option value=''>Seleccionar...</option>";
  municipioAdd.innerHTML = "<option value=''>Seleccionar...</option>";

  if (departamentosPorRegion[region]) {
    departamentosPorRegion[region].forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      departamentoAdd.appendChild(opt);
    });
  }
});

/* ============================================================
   CARGAR MUNICIPIOS SEGÚN DEPARTAMENTO
============================================================ */
export function cargarMunicipios() {
  const departamento = departamentoAdd.value;

  municipioAdd.innerHTML = "<option value=''>Seleccionar...</option>";

  if (municipiosPorDepartamento[departamento]) {
    municipiosPorDepartamento[departamento].forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      municipioAdd.appendChild(opt);
    });
  }
}

departamentoAdd.addEventListener("change", cargarMunicipios);

/* ============================================================
   INICIO
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  cargarSolicitantes();

  searchInput.addEventListener("input", aplicarFiltros);
  filtroDepartamento.addEventListener("change", aplicarFiltros);
});

/* ============================================================
   GET SOLICITANTES
============================================================ */
async function cargarSolicitantes() {
  tableBody.innerHTML = `<tr><td colspan="8">Cargando...</td></tr>`;
  try {
    listaSolicitantes = await service.obtenerTodos();
    tableBody.innerHTML = "";

    if (!listaSolicitantes.length) {
      tableBody.innerHTML = `<tr><td colspan="8">No hay registros</td></tr>`;
      return;
    }

    listaSolicitantes.forEach(s => crearFila(s));
  } catch {
    tableBody.innerHTML = `<tr><td colspan="8">Error cargando datos</td></tr>`;
  }
}

/* ============================================================
   FILTROS
============================================================ */
function aplicarFiltros() {
  const texto = searchInput.value.toLowerCase().trim();
  const depto = filtroDepartamento.value;

  const filtrados = listaSolicitantes.filter(s => {
    const coincideTexto =
      s.nombre.toLowerCase().includes(texto) ||
      s.unidad_depto.toLowerCase().includes(texto) ||
      s.cargo.toLowerCase().includes(texto) ||
      s.telefono.toLowerCase().includes(texto) ||
      s.correo.toLowerCase().includes(texto);

    const coincideDepto = depto === "" || s.departamento === depto;

    return coincideTexto && coincideDepto;
  });

  tableBody.innerHTML = "";

  if (!filtrados.length) {
    tableBody.innerHTML = `<tr><td colspan="8">Sin resultados</td></tr>`;
    return;
  }

  filtrados.forEach(s => crearFila(s));
}

/* ============================================================
   CREAR FILA
============================================================ */
function crearFila(s) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${s.id}</td>
    <td>${s.nombre}</td>
    <td>${s.unidad_depto}</td>
    <td>${s.cargo}</td>
    <td>${s.departamento}</td>
    <td>${s.telefono}</td>
    <td>${s.correo}</td>
    <td>
      <i class="fa-solid fa-pen-to-square text-primary me-2 edit-btn" style="cursor:pointer;"></i>
      <i class="fa-solid fa-trash text-danger me-2 delete-btn" style="cursor:pointer;"></i>
      <i class="fa-solid fa-eye text-secondary ver-detalle" style="cursor:pointer;"></i>
    </td>
  `;

  tableBody.appendChild(tr);

  tr.querySelector(".edit-btn").addEventListener("click", () => abrirEditar(s));
  tr.querySelector(".delete-btn").addEventListener("click", () => eliminarSolicitante(s.id));
  tr.querySelector(".ver-detalle").addEventListener("click", () => mostrarDetalles(s));
}

/* ============================================================
   EDITAR
============================================================ */
function abrirEditar(s) {
  overlay.style.display = "block";
  addModal.style.display = "block";
  document.body.classList.add("blurred");

  addForm.dataset.editando = "true";
  addForm.dataset.id = s.id;

  unidadAdd.value = s.unidad_depto;
  nombreAdd.value = s.nombre;
  cargoAdd.value = s.cargo;
  correoAdd.value = s.correo;
  telefonoAdd.value = s.telefono;

  regionAdd.value = s.region;

  // cargar departamentos según región
  regionAdd.dispatchEvent(new Event("change"));

  departamentoAdd.value = s.departamento;

  cargarMunicipios();

  municipioAdd.value = s.municipio;

  ubicadoAdd.value = s.ubicado_en;
  direccionAdd.value = s.direccion;
}

/* ============================================================
   CERRAR FORMULARIO
============================================================ */
function cerrarFormulario() {
  overlay.style.display = "none";
  addModal.style.display = "none";
  document.body.classList.remove("blurred");

  addForm.reset();
  addForm.dataset.editando = "false";
}

/* ============================================================
   SUBMIT
============================================================ */
addForm.addEventListener("submit", async e => {
  e.preventDefault();

  if (!/^[267][0-9]{7}$/.test(telefonoAdd.value)) {
    Swal.fire("Error", "Número telefónico inválido (El Salvador)", "error");
    return;
  }

  const dto = {
    nombre: nombreAdd.value,
    unidad_depto: unidadAdd.value,
    cargo: cargoAdd.value,
    correo: correoAdd.value,
    telefono: telefonoAdd.value,
    region: regionAdd.value,
    departamento: departamentoAdd.value,
    municipio: municipioAdd.value,
    ubicado_en: ubicadoAdd.value,
    direccion: direccionAdd.value
  };

  try {
    if (addForm.dataset.editando === "true") {
      await service.actualizar(addForm.dataset.id, dto);
      Swal.fire("Actualizado", "Registro modificado correctamente", "success");
    } else {
      await service.crear(dto);
      Swal.fire("Guardado", "Nuevo solicitante agregado", "success");
    }

    cerrarFormulario();
    cargarSolicitantes();

  } catch {
    Swal.fire("Error", "No se pudo guardar la información", "error");
  }
});

/* ============================================================
   ELIMINAR
============================================================ */
async function eliminarSolicitante(id) {
  const conf = await Swal.fire({
    title: "¿Eliminar registro?",
    text: "Esta acción es irreversible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar"
  });

  if (conf.isConfirmed) {
    await service.eliminar(id);
    cargarSolicitantes();
    Swal.fire("Eliminado", "Registro eliminado correctamente", "success");
  }
}

/* ============================================================
   MOSTRAR INFO
============================================================ */
function mostrarDetalles(s) {
  document.getElementById("nombreInfo").textContent = s.nombre;
  document.getElementById("unidadInfo").textContent = s.unidad_depto;
  document.getElementById("cargoInfo").textContent = s.cargo;
  document.getElementById("departamentoInfo").textContent = s.departamento;
  document.getElementById("municipioInfo").textContent = s.municipio;
  document.getElementById("telefonoInfo").textContent = s.telefono;
  document.getElementById("correoInfo").textContent = s.correo;
  document.getElementById("regionInfo").textContent = s.region;
  document.getElementById("direccionInfo").textContent = s.direccion;

  overlay.style.display = "block";
  document.getElementById("infoModal").style.display = "block";
  document.body.classList.add("blurred");
}

window.cerrarModal = function () {
  overlay.style.display = "none";
  document.getElementById("infoModal").style.display = "none";
  document.body.classList.remove("blurred");
};

/* ============================================================
   ABRIR FORMULARIO
============================================================ */
document.getElementById("addBtn").addEventListener("click", () => {
  overlay.style.display = "block";
  addModal.style.display = "block";
  document.body.classList.add("blurred");

  addForm.dataset.editando = "false";
  addForm.reset();
});

/* ============================================================
   CERRAR FORMULARIO
============================================================ */
document.getElementById("closeAddForm").addEventListener("click", cerrarFormulario);
overlay.addEventListener("click", cerrarFormulario);
