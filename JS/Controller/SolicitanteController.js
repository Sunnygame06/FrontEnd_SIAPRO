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

document.addEventListener("DOMContentLoaded", () => {
  cargarSolicitantes();
  searchInput.addEventListener("input", aplicarFiltros);
  filtroDepartamento.addEventListener("change", aplicarFiltros);
});

async function cargarSolicitantes() {
  tableBody.innerHTML = `<tr><td colspan="8">Cargando...</td></tr>`;
  try {
    listaSolicitantes = await service.obtenerTodos();
    tableBody.innerHTML = "";
    if (!listaSolicitantes || listaSolicitantes.length === 0) {
      tableBody.innerHTML = `<tr><td colspan='8'>No hay registros</td></tr>`;
      return;
    }
    listaSolicitantes.forEach(s => crearFila(s));
  } catch {
    tableBody.innerHTML = `<tr><td colspan="8">Error cargando datos</td></tr>`;
  }
}
function aplicarFiltros() {
  let texto = searchInput.value.toLowerCase().trim();
  let depto = filtroDepartamento.value.trim();

  let filtrados = listaSolicitantes.filter(s => {
    const coincideTexto =
      s.nombre.toLowerCase().includes(texto) ||
      s.unidad_depto.toLowerCase().includes(texto) ||
      s.cargo.toLowerCase().includes(texto) ||
      s.telefono.toLowerCase().includes(texto) ||
      s.correo.toLowerCase().includes(texto) ||
      s.municipio.toLowerCase().includes(texto) ||
      s.direccion.toLowerCase().includes(texto);

    const coincideDepto = depto === "" || s.departamento === depto;

    return coincideTexto && coincideDepto;
  });

  tableBody.innerHTML = "";

  if (filtrados.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8">Sin resultados</td></tr>`;
    return;
  }

  filtrados.forEach(s => crearFila(s));
}


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

  tr.querySelector(".edit-btn").addEventListener("click", () => abrirFormularioEditar(s));
  tr.querySelector(".delete-btn").addEventListener("click", () => eliminarSolicitante(s.id));
  tr.querySelector(".ver-detalle").addEventListener("click", () => mostrarDetalles(s));
}

async function eliminarSolicitante(id) {
  const confirm = await Swal.fire({
    title: "¿Eliminar?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar"
  });

  if (confirm.isConfirmed) {
    await service.eliminar(id);
    cargarSolicitantes();
    Swal.fire("Eliminado", "Registro eliminado con éxito", "success");
  }
}

function abrirFormularioEditar(s) {
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

  if (typeof cargarDepartamentos === "function") cargarDepartamentos();
  departamentoAdd.value = s.departamento;

  if (typeof cargarMunicipios === "function") cargarMunicipios();
  municipioAdd.value = s.municipio;

  ubicadoAdd.value = s.ubicado_en;
  direccionAdd.value = s.direccion;
}

function cerrarFormulario() {
  overlay.style.display = "none";
  addModal.style.display = "none";
  document.body.classList.remove("blurred");
  addForm.reset();
  addForm.dataset.editando = "false";
  addForm.dataset.id = "";
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

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
      const id = addForm.dataset.id;
      await service.actualizar(id, dto);
      Swal.fire("Actualizado", "El registro fue actualizado con éxito", "success");
    } else {
      await service.crear(dto);
      Swal.fire("Guardado", "Solicitante agregado correctamente", "success");
    }

    cerrarFormulario();
    cargarSolicitantes();

  } catch {
    Swal.fire({
      title: "Error",
      text: "Ocurrió un error al enviar la información",
      icon: "error"
    });
  }
});

overlay.addEventListener("click", cerrarFormulario);

function mostrarDetalles(s) {
  document.getElementById("nombreInfo").textContent = s.nombre || "N/A";
  document.getElementById("unidadInfo").textContent = s.unidad_depto || "N/A";
  document.getElementById("cargoInfo").textContent = s.cargo || "N/A";
  document.getElementById("departamentoInfo").textContent = s.departamento || "N/A";
  document.getElementById("telefonoInfo").textContent = s.telefono || "N/A";
  document.getElementById("correoInfo").textContent = s.correo || "N/A";
  document.getElementById("municipioInfo").textContent = s.municipio || "N/A";
  document.getElementById("direccionInfo").textContent = s.direccion || "N/A";
  document.getElementById("regionInfo").textContent = s.region || "N/A";
  document.getElementById("ubicadoInfo").textContent = s.ubicado_en || "N/A";

  document.getElementById("infoModal").style.display = "block";
  overlay.style.display = "block";
  document.body.classList.add("blurred");
}

window.cerrarModal = function () {
  document.getElementById("infoModal").style.display = "none";
  overlay.style.display = "none";
  document.body.classList.remove("blurred");
};
