// JS/Services/InventarioInsumoService.js
const BASE = "http://localhost:8080/apiInventario";

export const InventarioInsumoService = {

  listar: async (search = "", page = 0, size = 12) => {
    const url = `${BASE}/getAllInventarios?page=${page}&size=${size}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "Error al obtener insumos");
    }

    const data = await resp.json();

    // NORMALIZAR PARA QUE SIEMPRE SEA ARRAY
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return { content: data.content, ...data };

    return { content: [], ...data };
  },

  obtenerPorId: async (id) => {
    const resp = await fetch(`${BASE}/getInventario/${id}`);
    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "No se pudo obtener el insumo");
    }
    return await resp.json();
  },

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

  eliminar: async (id) => {
    const resp = await fetch(`${BASE}/deleteInventario/${id}`, {
      method: "DELETE"
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "Error al eliminar insumo");
    }

    return true;
  }
};
