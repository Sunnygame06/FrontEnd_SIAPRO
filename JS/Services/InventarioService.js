// JS/Services/InventarioService.js
export class EquipoService {
    constructor() {
        this.BASE_URL = "http://localhost:8080/apiEquipo";
    }

    // ======================================================
    // 🔵 GET — Obtener todos los equipos (PAGINADO) — devuelve objeto Page<T>
    // ======================================================
    async getAllEquipos(page = 0, size = 10) {
        try {
            const response = await fetch(`${this.BASE_URL}/getAllEquipos?page=${page}&size=${size}`);
            if (!response.ok) {
                console.error("Error al obtener equipos:", response.status);
                return { content: [], totalPages: 0, totalElements: 0 };
            }
            const data = await response.json();
            // Devolvemos el objeto completo para que el controller pueda leer totalPages, totalElements, content...
            return data;
        } catch (error) {
            console.error("Error en GET getAllEquipos:", error);
            return { content: [], totalPages: 0, totalElements: 0 };
        }
    }

    // ======================================================
    // 🔵 POST — Crear nuevo equipo
    // ======================================================
    async crearEquipo(equipo) {
        try {
            const response = await fetch(`${this.BASE_URL}/newEquipo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(equipo)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error en POST crearEquipo:", error);
            return { status: "Error", message: "No se pudo crear el equipo" };
        }
    }

    // ======================================================
    // 🔴 DELETE — Eliminar equipo por ID
    // ======================================================
    async deleteEquipo(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/deleteEquipo/${id}`, { method: "DELETE" });
            if (!response.ok) {
                console.error("Error en DELETE:", response.status);
                return { status: "Error" };
            }
            return { status: "Completado" };
        } catch (error) {
            console.error("Error en DELETE deleteEquipo:", error);
            return { status: "Error" };
        }
    }

    // ======================================================
    // 🔵 PUT — Actualizar equipo
    // ======================================================
    async updateEquipo(id, equipo) {
        try {
            const response = await fetch(`${this.BASE_URL}/updateEquipo/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(equipo)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error en PUT updateEquipo:", error);
            return { status: "Error" };
        }
    }
}
