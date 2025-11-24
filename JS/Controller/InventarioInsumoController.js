// JS/Controller/InventarioInsumoController.js
import { InventarioInsumoService } from "../Services/InventarioInsumoService.js";

const $ = (sel) => document.querySelector(sel);

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = $("#addBtn");
  const modal = $("#addModal");
  const overlay = $("#overlay");
  const closeBtn = $("#closeAddForm");
  const form = $("#formInsumos");
  const searchInput = $("#searchInput");
  const marcaFilter = $("#marcaFilter");
  const cardsContainer = $("#cardsContainer");
  const noResults = $("#noResults");

  let currentPage = 0;
  let pageSize = 12;
  let currentList = []; // contenido para filtrar en cliente
  let editingId = null;

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
  }

  addBtn.addEventListener("click", () => {
    editingId = null;
    form.reset();
    openModal();
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  async function cargarInsumos() {
    try {
      const page = await InventarioInsumoService.listar("", currentPage, pageSize);
      // backend devuelve Page<InventarioDTO> o similar; algunos controladores devuelven objeto con content
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
      Swal.fire("Error", err.message || "No se pudieron cargar insumos", "error");
    }
  }

  function normalizeItem(i) {
    // backend structure might be { data: { ... } } for getById; for list assume objects with fields
    const item = (i?.data) ? i.data : i;
    return {
      id: item.id,
      nombre: item.nombre,
      proyecto: item.proyecto,
      fecha: item.fecha,
      marca: item.marca ?? item.barcaa ?? "",
      unidad_medida: item.unidad_medida ?? item.unidadMedian ?? "",
      cantidad: item.cantidad,
      presentacion: item.presentacion ?? ""
    };
  }

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
          <div class="left">
            <button class="btn btn-primary btn-sm btn-sm-icon btn-edit" data-id="${insumo.id}" title="Editar">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
          <div class="right">
            <button class="btn btn-danger btn-sm btn-sm-icon btn-delete" data-id="${insumo.id}" title="Eliminar">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      cardsContainer.appendChild(card);
    });

    // attach actions
    cardsContainer.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = btn.getAttribute("data-id");
        try {
          // buscar en la lista local primero
          const found = currentList.find(x => String(x.id) === String(id));
          if (found) {
            fillForm(found);
            editingId = id;
            openModal();
            return;
          }
          // si no está en local pedir al backend
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

    cardsContainer.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-id");
        Swal.fire({
          title: "¿Eliminar?",
          text: "Esta acción no se puede deshacer",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        }).then(async (res) => {
          if (res.isConfirmed) {
            try {
              await InventarioInsumoService.eliminar(id);
              await cargarInsumos();
              Swal.fire("Eliminado", "Insumo eliminado correctamente", "success");
            } catch (err) {
              console.error(err);
              Swal.fire("Error", err.message || "No se pudo eliminar", "error");
            }
          }
        });
      });
    });
  }

  function fillForm(item) {
    $("#nombre_insumo").value = item.nombre ?? "";
    $("#proyecto_insumo").value = item.proyecto ?? "";
    $("#fecha_insumo").value = (item.fecha ? item.fecha : "");
    $("#marca_insumo").value = item.marca ?? "";
    $("#unidadMedida_insumo").value = item.unidad_medida ?? "";
    $("#cantidad_insumo").value = item.cantidad ?? "";
    $("#presentacion_insumo").value = item.presentacion ?? "";
  }

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
      if (!payload.nombre) throw new Error("Nombre es requerido");
      if (!payload.proyecto) throw new Error("Proyecto es requerido");

      if (editingId == null) {
        await InventarioInsumoService.guardar(payload);
        Swal.fire("Guardado", "Insumo guardado correctamente", "success");
      } else {
        await InventarioInsumoService.actualizar(editingId, payload);
        Swal.fire("Actualizado", "Insumo actualizado correctamente", "success");
      }
      closeModal();
      await cargarInsumos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Error al guardar", "error");
    }
  });

  // SEARCH + BRAND FILTER
  searchInput.addEventListener("input", () => {
    // aplicamos debounce simple
    clearTimeout(searchInput._deb);
    searchInput._deb = setTimeout(applyFiltersAndRender, 220);
  });

  marcaFilter.addEventListener("change", applyFiltersAndRender);

  function applyFiltersAndRender() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const marca = (marcaFilter.value || "").trim().toLowerCase();

    let list = currentList.slice();

    if (q) {
      list = list.filter(i => (i.nombre || "").toLowerCase().includes(q));
    }
    if (marca) {
      list = list.filter(i => (i.marca || "").toLowerCase() === marca);
    }

    renderCards(list);
  }

  function populateMarcaFilter(list) {
    const marcas = [...new Set(list.map(i => (i.marca || "").trim()).filter(Boolean))].sort();
    // limpiar opciones excepto la primera
    marcaFilter.innerHTML = `<option value="">Todas las marcas</option>`;
    marcas.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      marcaFilter.appendChild(opt);
    });
  }

  // small util
  function escapeHtml(str = "") {
    return String(str).replace(/[&<>"']/g, (s) => ({ '&': '&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  // inicial
  cargarInsumos();
});
