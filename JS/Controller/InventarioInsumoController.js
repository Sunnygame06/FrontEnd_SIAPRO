// JS/Controller/InventarioInsumoController.js
import { InventarioInsumoService } from "../Services/InventarioInsumoService.js";

const $ = (sel) => document.querySelector(sel);

document.addEventListener("DOMContentLoaded", () => {

  const addBtn = $("#addBtn");
  const modal = $("#addModal");
  const overlay = $("#overlay");
  const closeBtn = $("#closeAddForm");
  const form = $("#formInsumos");
  const titleModal = $("#addModal h3");

  const searchInput = $("#searchInput");
  const marcaFilter = $("#marcaFilter");
  const cardsContainer = $("#cardsContainer");
  const noResults = $("#noResults");

  let currentList = [];
  let currentPage = 0;
  let pageSize = 12;
  let editingId = null;

  /* ==============================
      MODAL
  ===============================*/
  function openModal() {
    modal.style.display = "block";
    overlay.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.style.display = "none";
    overlay.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    form.reset();
    editingId = null;
    titleModal.textContent = "Agregar Insumo";
  }

  addBtn.addEventListener("click", () => {
    editingId = null;
    titleModal.textContent = "Agregar Insumo";
    form.reset();
    openModal();
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  /* ==============================
      LISTAR INSUMOS
  ===============================*/
  async function cargarInsumos() {
    try {
      const page = await InventarioInsumoService.listar("", currentPage, pageSize);
      const content = page?.content ?? page;

      if (!content || content.length === 0) {
        currentList = [];
        renderCards([]);
        return;
      }

      currentList = content.map(x => normalizeItem(x));
      populateMarcaFilter(currentList);
      applyFiltersAndRender();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los insumos", "error");
    }
  }

  function normalizeItem(i) {
    const item = (i?.data) ? i.data : i;
    return {
      id: item.id,
      nombre: item.nombre,
      proyecto: item.proyecto,
      fecha: item.fecha,
      marca: item.marca ?? "",
      unidad_medida: item.unidad_medida ?? "",
      cantidad: item.cantidad,
      presentacion: item.presentacion ?? ""
    };
  }

  /* ==============================
      TARJETAS
  ===============================*/
  function renderCards(list) {
    cardsContainer.innerHTML = "";

    if (!list || list.length === 0) {
      noResults.style.display = "block";
      return;
    }

    noResults.style.display = "none";

    list.forEach(insumo => {
      const card = document.createElement("div");
      card.className = "info-card";

      card.innerHTML = `
        <div class="top">
          <h3>${escapeHtml(insumo.nombre)}</h3>
          <div class="meta">
            <div><strong>Cantidad:</strong> ${insumo.cantidad ?? "-"}</div>
            <div><strong>Proyecto:</strong> ${insumo.proyecto ?? "-"}</div>
          </div>
          <div class="brand">Marca: ${escapeHtml(insumo.marca || "-")}</div>
        </div>

        <div class="actions mt-3">
          <button class="btn btn-primary btn-sm btn-edit" data-id="${insumo.id}" title="Editar">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="btn btn-danger btn-sm btn-delete" data-id="${insumo.id}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    // EDITAR
    cardsContainer.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        titleModal.textContent = "Editar Insumo";
        try {
          const found = currentList.find(x => String(x.id) === String(id));
          if (found) {
            fillForm(found);
            editingId = id;
            openModal();
            return;
          }

          const resp = await InventarioInsumoService.obtenerPorId(id);
          const normalized = normalizeItem(resp?.data ?? resp);
          fillForm(normalized);
          editingId = id;
          openModal();

        } catch (err) {
          console.error(err);
          Swal.fire("Error", "No se pudo cargar el insumo", "error");
        }
      });
    });

    // ELIMINAR
    cardsContainer.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");

        Swal.fire({
          title: "¿Eliminar?",
          text: "Esta acción no se puede deshacer",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        }).then(async res => {
          if (res.isConfirmed) {
            try {
              await InventarioInsumoService.eliminar(id);
              await cargarInsumos();
              Swal.fire("Eliminado", "Insumo eliminado correctamente", "success");
            } catch (err) {
              Swal.fire("Error", "No se pudo eliminar", "error");
              console.error(err);
            }
          }
        });
      });
    });
  }

  function fillForm(item) {
    $("#nombre_insumo").value = item.nombre;
    $("#proyecto_insumo").value = item.proyecto;
    $("#fecha_insumo").value = item.fecha;
    $("#marca_insumo").value = item.marca;
    $("#unidadMedida_insumo").value = item.unidad_medida;
    $("#cantidad_insumo").value = item.cantidad;
    $("#presentacion_insumo").value = item.presentacion;
  }

  /* ==============================
      VALIDACIONES Y SUBMIT
  ===============================*/
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      nombre: $("#nombre_insumo").value.trim(),
      proyecto: Number($("#proyecto_insumo").value),
      fecha: $("#fecha_insumo").value,
      marca: $("#marca_insumo").value.trim(),
      unidad_medida: $("#unidadMedida_insumo").value.trim(),
      cantidad: Number($("#cantidad_insumo").value),
      presentacion: $("#presentacion_insumo").value.trim()
    };

    try {
      if (!payload.nombre) throw new Error("El nombre es obligatorio");
      if (!payload.proyecto || payload.proyecto <= 0) throw new Error("Proyecto inválido");
      if (!payload.fecha) throw new Error("La fecha es obligatoria");
      if (!payload.cantidad || payload.cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

      if (editingId === null) {
        await InventarioInsumoService.guardar(payload);
        Swal.fire("Guardado", "Insumo guardado correctamente", "success");
      } else {
        await InventarioInsumoService.actualizar(editingId, payload);
        Swal.fire("Actualizado", "Insumo actualizado correctamente", "success");
      }

      closeModal();
      await cargarInsumos();

    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  });

  /* ==============================
      FILTROS
  ===============================*/
  searchInput.addEventListener("input", () => {
    clearTimeout(searchInput._deb);
    searchInput._deb = setTimeout(applyFiltersAndRender, 200);
  });

  marcaFilter.addEventListener("change", applyFiltersAndRender);

  function applyFiltersAndRender() {
    const q = searchInput.value.toLowerCase();
    const marca = marcaFilter.value.toLowerCase();

    let list = currentList.slice();

    if (q) list = list.filter(i => (i.nombre || "").toLowerCase().includes(q));
    if (marca) list = list.filter(i => (i.marca || "").toLowerCase() === marca);

    renderCards(list);
  }

  function populateMarcaFilter(list) {
    const marcas = [...new Set(list.map(i => (i.marca || "").trim()).filter(Boolean))].sort();
    marcaFilter.innerHTML = `<option value="">Todas las marcas</option>`;
    marcas.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      marcaFilter.appendChild(opt);
    });
  }

  function escapeHtml(str = "") {
    return String(str).replace(/[&<>"']/g, (s) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[s]));
  }

  // Cargar insumos al iniciar
  cargarInsumos();
});
