// JS/Services/InventarioInsumoService.js
const BASE = "http://localhost:8080/apiInventario";

export const InventarioInsumoService = {
  listar: async (search = "", page = 0, size = 12) => {
    // Endpoint del backend: /apiInventario/getAllInventarios?page=..&size=..
    const url = `${BASE}/getAllInventarios?page=${page}&size=${size}`;
    // backend permite paginado; hay que pasar search por query si lo manejas backend (si no, lo filtramos cliente)
    const resp = await fetch(url);
    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(txt || "Error al obtener insumos");
    }
    return await resp.json(); // Page<InventarioDTO> (con content, totalElements, ...)
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
    // Ajustar payload a DTO: nombre, proyecto, fecha, marca, unidad_medida, cantidad, presentacion
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
    // backend devuelve OK con cuerpo o vacío; devolvemos true
    return true;
  }
};
