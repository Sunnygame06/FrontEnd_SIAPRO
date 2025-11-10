// Clase encargada de manejar todas las peticiones HTTP hacia la API del backend
class SolicitanteService {
  constructor(baseUrl) {
    // Se define la URL base que apunta al backend (sin endpoints específicos)
    this.baseUrl = baseUrl;
  }

  // Método para obtener todos los registros de solicitantes
  async obtenerTodos() {
    const res = await fetch(this.baseUrl); // Petición GET al endpoint base
    return res.json(); // Convierte la respuesta a JSON y la devuelve
  }

  // Método para crear un nuevo solicitante
  async crear(solicitante) {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(solicitante)
    });
    return res.json();
  }

  // Método para actualizar un solicitante existente por su ID
  async actualizar(id, solicitante) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(solicitante)
    });
    return res.json();
  }

  // Método para eliminar un solicitante por su ID
  async eliminar(id) {
    return fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
  }
}

// ✅ Exporta la clase para poder importarla desde el Controller
export { SolicitanteService };
