export class EquipoService {

    constructor() {
        this.BASE_URL = "http://localhost:8080/apiEquipo";
    }

    // ======================================================
    // GET — Obtener todos los equipos (paginado)
    // ======================================================
    async getAllEquipos(page = 0, size = 10) {
        try {
            const response = await fetch(`${this.BASE_URL}/getAllEquipos?page=${page}&size=${size}`);

            if (!response.ok) {
                return { content: [], totalPages: 0, totalElements: 0, size, page };
            }

            const data = await response.json();

            return {
                content: data.content ?? [],
                totalPages: data.totalPages ?? 0,
                totalElements: data.totalElements ?? 0,
                size: data.size ?? size,
                page: data.number ?? page
            };

        } catch (error) {
            console.error("Error en getAllEquipos:", error);
            return { content: [], totalPages: 0, totalElements: 0, size, page };
        }
    }

    // ======================================================
    // GET — Obtener un equipo por ID
    // ======================================================
    async getEquipoById(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/getEquipoById/${id}`);

            if (!response.ok) {
                return { status: "Error", message: "Equipo no encontrado" };
            }

            const data = await response.json();
            return data?.data ?? { status: "Error", message: "Sin datos" };

        } catch (error) {
            console.error("Error en getEquipoById:", error);
            return { status: "Error", message: "Error inesperado" };
        }
    }

    // ======================================================
    // POST — Crear equipo
    // ======================================================
    async crearEquipo(equipo) {
        try {
            const response = await fetch(`${this.BASE_URL}/newEquipo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(equipo)
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                return data ?? { status: "Error", message: "No se pudo crear el equipo" };
            }

            return data ?? { status: "Completado" };

        } catch (error) {
            console.error("Error en crearEquipo:", error);
            return { status: "Error", message: "No se pudo crear el equipo" };
        }
    }

    // ======================================================
    // PUT — Actualizar equipo
    // ======================================================
async updateEquipo(id, equipo) {
    try {
        if (!id) return { status: "Error", message: "ID inválido" };

        const response = await fetch(`${this.BASE_URL}/updateEquipo/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(equipo)
        });

        if (response.status === 404) {
            return { status: "Error", message: "Equipo no encontrado" };
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            return data ?? { status: "Error", message: "No se pudo actualizar" };
        }

        return data ?? { status: "Completado" };

    } catch (error) {
        return { status: "Error", message: "Error inesperado" };
    }
}

    // ======================================================
    // DELETE — Eliminar equipo
    // ======================================================
    async deleteEquipo(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/deleteEquipo/${id}`, {
                method: "DELETE"
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                return data ?? { status: "Error", message: "No se pudo eliminar" };
            }

            return { status: "Completado" };

        } catch (error) {
            console.error("Error en deleteEquipo:", error);
            return { status: "Error", message: "Error inesperado al eliminar" };
        }
    }
}
