// ============================================================
//  PUNTO DE ENTRADA - Ejemplos de uso del módulo
// ============================================================

import {
    Estudiante,
    Asignatura,
    EstadoMatricula,
    generarReporte,
} from "./types/universidad.js";
import { apiClient } from "./services/api-client.js";

const estadoActivo: EstadoMatricula = {
    type: "ACTIVA",
    startDate: new Date("2025-09-01"),
    semester: "2025-2026 / Primer Semestre",
    subjects: [
        {
            id: "a-101",
            name: "Cálculo I",
            credits: 6,
            course: 1,
            department: "Matemáticas",
            mandatory: true,
        },
        {
            id: "a-102",
            name: "Programación Orientada a Objetos",
            credits: 6,
            course: 1,
            department: "Informática",
            mandatory: true,
        },
    ],
};

const estadoSuspendido: EstadoMatricula = {
    type: "SUSPENDIDA",
    suspensionDate: new Date("2025-11-10"),
    suspensionReason: "Baja médica prolongada",
    expectedReincorporation: new Date("2026-02-01"),
};

const estadoFinalizado: EstadoMatricula = {
    type: "FINALIZADA",
    endDate: new Date("2025-06-30"),
    gradeAverage: 8.45,
    obtainedDegree: "Grado en Ingeniería Informática",
};

console.log("=== REPORTES DE MATRÍCULA ===\n");
console.log(generarReporte(estadoActivo));
console.log("\n" + generarReporte(estadoSuspendido));
console.log("\n" + generarReporte(estadoFinalizado));

// --- Ejemplo 2: Usar el cliente de API genérico ---

async function main() {
    console.log("\n=== LLAMADAS AL SERVICIO DE DATOS ===\n");

    // Obtener todos los estudiantes
    const respuestaEstudiantes = await apiClient.obtenerRecurso<Estudiante>(
        "/estudiantes"
    );
    console.log(`[${respuestaEstudiantes.status}] ${respuestaEstudiantes.message}\n`);
    console.log("Estudiantes:", respuestaEstudiantes.data.map((e) => e.name));

    // Obtener todas las asignaturas
    const respuestaAsignaturas = await apiClient.obtenerRecurso<Asignatura>(
        "/asignaturas"
    );
    console.log(
        `\n[${respuestaAsignaturas.status}] ${respuestaAsignaturas.message}`
    );
    console.log(
        "Asignaturas:",
        respuestaAsignaturas.data.map((a) => `${a.name} (${a.credits} cr.)`)
    );

    // Obtener un recurso por ID
    const respuestaUnica = await apiClient.obtenerRecursoPorId<Estudiante>(
        "/estudiantes",
        "e-001"
    );
    console.log(`\n[${respuestaUnica.status}] ${respuestaUnica.message}`);
    if (respuestaUnica.data) {
        console.log(
            `Estudiante encontrado: ${respuestaUnica.data.name} ${respuestaUnica.data.surname}`
        );
    }

    // Endpoint inexistente
    const respuestaError = await apiClient.obtenerRecurso("/profesores");
    console.log(
        `\n[${respuestaError.status}] ERROR: ${respuestaError.message}`
    );
}

main().catch(console.error);