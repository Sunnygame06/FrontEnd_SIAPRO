import { SolicitanteService } from "../Services/SolicitanteService.js";

// Referencias a los elementos del DOM que se usarán dentro del controlador
const tableBody = document.querySelector("#solicitanteTable tbody"); // Cuerpo de la tabla donde se mostrarán los datos
const form = document.getElementById("SolicitanteForm"); // Formulario dentro del modal
const modal = new bootstrap.Modal(document.getElementById("formModal")); // Instancia del modal Bootstrap
const lbModal = document.getElementById("SolicitanteModalLabel"); // Etiqueta del título del modal
const btnAdd = document.getElementById("addBtn"); // Botón para agregar nuevo solicitante
const filtroDepartamento = document.getElementById("filtroDepartamento"); // Select para filtrar por departamento
const searchInput = document.getElementById("searchInput"); // Input de búsqueda

// URL base de la API en el backend
const API_URL = "http://localhost:8080/api/solicitantes";
const service = new SolicitanteService(API_URL); // Se crea una instancia del servicio

// Cuando el documento haya cargado completamente, se ejecuta la función para cargar los datos iniciales
document.addEventListener("DOMContentLoaded", () => {
  cargarSolicitantes(); // Carga inicial de solicitantes
});

// Evento que se activa al hacer clic en el botón “Agregar Solicitante”
btnAdd.addEventListener("click", () => {
  lbModal.textContent = "Agregar Nuevo Solicitante"; // Se cambia el texto del título del modal
  form.reset(); // Limpia todos los campos del formulario
  form.dataset.editing = false; // Marca el formulario como modo creación
  modal.show(); // Abre el modal de Bootstrap
});

// Evento de envío del formulario (tanto para agregar como para editar)
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita el comportamiento por defecto de recargar la página

  // Se obtienen los valores ingresados por el usuario en los campos del formulario
  const solicitante = {
    nombre: document.getElementById("nombre").value,
    unidad: document.getElementById("unidad").value,
    cargo: document.getElementById("cargo").value,
    departamento: document.getElementById("departamento").value,
    telefono: document.getElementById("telefono").value,
    correo: document.getElementById("correo").value,
    municipio: document.getElementById("municipio").value,
    direccion: document.getElementById("direccion").value
  };

  // Se determina si el formulario está en modo edición o creación
  if (form.dataset.editing === "true") {
    const id = form.dataset.id; // Si está en edición, se obtiene el ID guardado en el dataset
    await service.actualizar(id, solicitante); // Llama al método PUT del servicio
  } else {
    await service.crear(solicitante); // Llama al método POST del servicio
  }

  modal.hide(); // Cierra el modal
  await cargarSolicitantes(); // Recarga la tabla actualizada
});

// Función para obtener y mostrar los solicitantes desde la API
async function cargarSolicitantes() {
  tableBody.innerHTML = "<tr><td colspan='10'>Cargando...</td></tr>"; // Mensaje temporal mientras se cargan los datos
  try {
    const data = await service.obtenerTodos(); // Se obtiene la lista desde el backend
    tableBody.innerHTML = ""; // Se limpia el contenido anterior
    data.forEach(solicitante => crearFila(solicitante)); // Se recorre el arreglo y se crean las filas dinámicamente
  } catch (err) {
    console.error("Error al cargar solicitantes", err); // En caso de error se muestra en consola
  }
}

// Crea dinámicamente una fila de la tabla con los datos del solicitante
function crearFila(cat) {
  const row = document.createElement("tr"); // Se crea una fila (TR)
  row.innerHTML = `
    <td>${cat.idSolicitante || ''}</td>
    <td>${cat.nombre || ''}</td>
    <td>${cat.unidad || ''}</td>
    <td>${cat.cargo || ''}</td>
    <td>${cat.departamento || ''}</td>
    <td>${cat.telefono || ''}</td>
    <td>${cat.correo || ''}</td>
    <td>${cat.municipio || ''}</td>
    <td>${cat.direccion || ''}</td>
    <td>
      <!-- Botones de acción para editar y eliminar -->
      <button class="btn btn-sm btn-outline-secondary edit-btn">✏️</button>
      <button class="btn btn-sm btn-outline-danger delete-btn">🗑️</button>
    </td>`;
  tableBody.appendChild(row); // Se agrega la fila al cuerpo de la tabla

  // Eventos para los botones de acción
  row.querySelector(".edit-btn").addEventListener("click", () => editarSolicitante(cat)); // Editar registro
  row.querySelector(".delete-btn").addEventListener("click", () => eliminarSolicitante(cat.idSolicitante)); // Eliminar registro
}

// Rellena el formulario con los datos de un solicitante existente para editarlo
function editarSolicitante(cat) {
  lbModal.textContent = "Editando Solicitante"; // Cambia el texto del modal
  form.dataset.editing = true; // Marca el formulario como modo edición
  form.dataset.id = cat.idSolicitante; // Guarda el ID del registro a editar

  // Asigna los valores del solicitante a los campos del formulario
  document.getElementById("nombre").value = cat.nombre || "";
  document.getElementById("unidad").value = cat.unidad || "";
  document.getElementById("cargo").value = cat.cargo || "";
  document.getElementById("departamento").value = cat.departamento || "";
  document.getElementById("telefono").value = cat.telefono || "";
  document.getElementById("correo").value = cat.correo || "";
  document.getElementById("municipio").value = cat.municipio || "";
  document.getElementById("direccion").value = cat.direccion || "";

  modal.show(); // Abre el modal con los datos cargados
}

// Elimina un solicitante del backend mediante confirmación del usuario
async function eliminarSolicitante(id) {
  if (confirm("¿Estás seguro de eliminar este solicitante?")) {
    await service.eliminar(id); // Llama al método DELETE del servicio
    await cargarSolicitantes(); // Recarga los datos actualizados
  }
}

// Filtra las filas según el departamento seleccionado en el menú desplegable
filtroDepartamento.addEventListener("change", () => {
  const filtro = filtroDepartamento.value.toLowerCase(); // Convierte el valor del filtro a minúsculas
  Array.from(tableBody.rows).forEach(row => {
    const departamento = row.cells[4].innerText.toLowerCase(); // Obtiene el texto del campo departamento
    row.style.display = filtro === "" || departamento === filtro ? "" : "none"; // Muestra u oculta según coincidencia
  });
});

// Filtra las filas de la tabla en tiempo real a medida que el usuario escribe en la barra de búsqueda
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase(); // Texto a buscar en minúsculas
  Array.from(tableBody.rows).forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none"; // Si el texto coincide, se muestra
  });
});
