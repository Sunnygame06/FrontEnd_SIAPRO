export class EquipoService {

    constructor() {
        this.BASE_URL = "http://localhost:8080/apiEquipo";
    }

    // ======================================================
    // 🔵 GET — Obtener todos los equipos (paginado)
    // ======================================================
    async getAllEquipos(page = 0, size = 50) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/getAllEquipos?page=${page}&size=${size}`
            );

            if (!response.ok) {
                console.error("Error al obtener equipos:", response.status);
                return [];
            }

            const data = await response.json();
            return data.content; // Vienen dentro del Page<T>
        } catch (error) {
            console.error("Error en GET getAllEquipos:", error);
            return [];
        }
    }

    // ======================================================
    // 🔵 POST — Crear nuevo equipo
    // ======================================================
    async crearEquipo(equipo) {
        try {
            const response = await fetch(`${this.BASE_URL}/newEquipo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(equipo)
            });

            const data = await response.json();
            return data;

        } catch (error) {
            console.error("Error en POST crearEquipo:", error);
            return {
                status: "Error",
                message: "No se pudo crear el equipo"
            };
        }
    }

    // ======================================================
// 🔴 DELETE — Eliminar equipo por ID
// ======================================================
async deleteEquipo(id) {
    try {
        const response = await fetch(`${this.BASE_URL}/deleteEquipo/${id}`, {
            method: "DELETE"
        });

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

async updateEquipo(id, equipo) {
    try {
        const response = await fetch(`${this.BASE_URL}/updateEquipo/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
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

