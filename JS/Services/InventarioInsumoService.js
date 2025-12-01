// JS/Services/InventarioInsumoService.js

const BASE = "http://localhost:8080/apiInventario";

export const InventarioInsumoService = {

  // ======================================================
  // 🔵 GET — Listar inventario (paginado o completo)
  // ======================================================
  listar: async (search = "", page = 0, size = 12) => {
    // Evitar error: backend exige size entre 1 y 50
    if (size < 1) size = 1;
    if (size > 50) size = 50;

    const url = `${BASE}/getAllInventarios?page=${page}&size=${size}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => resp.statusText);
      console.error("Error en listar inventario:", errorText);
      throw new Error(errorText || "Error al obtener insumos");
    }

    const data = await resp.json();

    // Normalizar: siempre devolver lista
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content;

    return [];
  },

  // ======================================================
  // 🔵 GET — Obtener un insumo por ID
  // ======================================================
  obtenerPorId: async (id) => {
    const resp = await fetch(`${BASE}/getInventario/${id}`);

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "No se pudo obtener el insumo");
    }

    return await resp.json();
  },

  // ======================================================
  // 🟢 POST — Guardar nuevo insumo
  // ======================================================
  guardar: async (data) => {
    const payload = {
      nombre: data.nombre,
      proyecto: Number(data.proyecto),
      fecha: data.fecha,
      marca: data.marca,
      unidad_medida: data.unidad_medida,
      cantidad: Number(data.cantidad),
      presentacion: data.presentacion || ""
    };

    const resp = await fetch(`${BASE}/newInventario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "Error al guardar insumo");
    }

    return await resp.json();
  },

  // ======================================================
  // 🔵 PUT — Actualizar insumo completo
  // ======================================================
  actualizar: async (id, data) => {
    const payload = {
      nombre: data.nombre,
      proyecto: Number(data.proyecto),
      fecha: data.fecha,
      marca: data.marca,
      unidad_medida: data.unidad_medida,
      cantidad: Number(data.cantidad),
      presentacion: data.presentacion || ""
    };

    const resp = await fetch(`${BASE}/updateInventario/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "Error al actualizar insumo");
    }

    return await resp.json();
  },

  // ======================================================
  // 🔴 DELETE — Eliminar insumo por ID
  // ======================================================
  eliminar: async (id) => {
    const resp = await fetch(`${BASE}/deleteInventario/${id}`, {
      method: "DELETE"
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "Error al eliminar insumo");
    }

    return true;
  },

  // ======================================================
  // 🟣 PATCH — Actualizar solo la cantidad del insumo
  // ======================================================
  actualizarCantidad: async (id, nuevaCantidad) => {
    const resp = await fetch(`${BASE}/updateCantidad/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: Number(nuevaCantidad) })
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "Error al actualizar cantidad del insumo");
    }

    return await resp.json();
  }
};
