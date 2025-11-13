class SolicitanteService {

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // ======================================
  // GET — Obtener todos (paginado real)
  // ======================================
  async obtenerTodos(page = 0, size = 50) {
    const url = `${this.baseUrl}/getAllSolicitantes?page=${page}&size=${size}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Error GET solicitantes:", res.status);
      return [];
    }

    const data = await res.json();
    return data.content || []; // Page<SolicitanteDTO>
  }

  // ======================================
  // POST — Crear solicitante
  // ======================================
  async crear(data) {
    const res = await fetch(`${this.baseUrl}/newSolicitante`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Error POST:", error);
      throw error;
    }

    return await res.json();
  }

  // ======================================
  // PUT — Actualizar solicitante
  // ======================================
  async actualizar(id, data) {
    const res = await fetch(`${this.baseUrl}/updateSolicitante/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Error PUT:", error);
      throw error;
    }

    return res.json();
  }

  // ======================================
  // DELETE — Eliminar solicitante
  // ======================================
  async eliminar(id) {
    const res = await fetch(`${this.baseUrl}/deleteSolicitante/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Error DELETE:", error);
      throw error;
    }

    return true;
  }

  // ======================================
  // FILTRO — Buscar por departamento
  // ======================================
  async filtrarPorDepartamento(departamento) {
    const todos = await this.obtenerTodos(0, 200);
    return todos.filter(s =>
      s.departamento.toLowerCase().includes(departamento.toLowerCase())
    );
  }

  // ======================================
  // FILTRO — Buscar por nombre
  // ======================================
  async filtrarPorNombre(nombre) {
    const todos = await this.obtenerTodos(0, 200);
    return todos.filter(s =>
      s.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }

  // ======================================
  // FILTRO — Combinado (depto + región + municipio)
  // ======================================
  async filtrar(departamento = "", region = "", municipio = "") {

    const todos = await this.obtenerTodos(0, 200);

    return todos.filter(s => {
      const okDepto = departamento === "" || s.departamento.toLowerCase().includes(departamento.toLowerCase());
      const okRegion = region === "" || s.region.toLowerCase().includes(region.toLowerCase());
      const okMunicipio = municipio === "" || s.municipio.toLowerCase().includes(municipio.toLowerCase());

      return okDepto && okRegion && okMunicipio;
    });
  }
}

export { SolicitanteService };
