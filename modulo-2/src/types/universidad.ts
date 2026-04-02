// ============================================================
//  ENTIDADES DEL DOMINIO - Sistema de Gestión Universitario
// ============================================================

/**
 * Represents a subject within the academic curriculum.
 */
export interface Asignatura {
    readonly id: string;
    name: string;
    credits: number;
    course: 1 | 2 | 3 | 4;
    department: string;
    mandatory: boolean;
}

/**
 * Represents a student enrolled at the university.
 */
export interface Estudiante {
    readonly dni: string;
    readonly id: string;
    name: string;
    surname: string;
    email: string;
    birthDate: Date;
    grade: string;
    joinedYear: number;
}

// ============================================================
//  UNIÓN DISCRIMINADA - EstadoMatricula
// ============================================================

/**
 * Active enrolment: the student is currently attending subjects this semester.
 */
export interface MatriculaActiva {
    type: "ACTIVA";
    startDate: Date;
    semester: string;
    subjects: Asignatura[];
}

/**
 * Suspended enrolment: the enrolment has been temporarily interrupted.
 * Records the suspension reason for traceability purposes.
 */
export interface MatriculaSuspendida {
    type: "SUSPENDIDA";
    suspensionDate: Date;
    suspensionReason: string;
    expectedReincorporation?: Date;
}

/**
 * Finalised enrolment: the student has completed or withdrawn from the degree.
 * Includes the final grade average obtained.
 */
export interface MatriculaFinalizada {
    type: "FINALIZADA";
    endDate: Date;
    gradeAverage: number;
    obtainedDegree?: string;
}

/**
 * Discriminated union that groups all possible enrolment states.
 * The `type` field acts as the discriminant for exhaustive narrowing.
 */
export type EstadoMatricula =
    | MatriculaActiva
    | MatriculaSuspendida
    | MatriculaFinalizada;

// ============================================================
//  FUNCIÓN generarReporte
// ============================================================

function assertNever(value: never, message?: string): never {
    throw new Error(message ?? `Estado de matrícula no contemplado: ${JSON.stringify(value)}`);
}

/**
 * Generates a descriptive string for the current enrolment state.
 *
 * @param state - The current enrolment state
 * @returns A human-readable string describing the enrolment state
 */
export function generarReporte(state: EstadoMatricula): string {
    switch (state.type) {
        case "ACTIVA": {
            const listaAsignaturas = state.subjects
                .map((a) => `  - ${a.name} (${a.credits} créditos)`)
                .join("\n");
            return (
                `MATRÍCULA ACTIVA\n` +
                `Semestre: ${state.semester}\n` +
                `Inicio: ${state.startDate.toLocaleDateString("es-ES")}\n` +
                `Asignaturas matriculadas (${state.subjects.length}):\n${listaAsignaturas}`
            );
        }

        case "SUSPENDIDA": {
            const reincorporacion = state.expectedReincorporation
                ? `\nReincorporación prevista: ${state.expectedReincorporation.toLocaleDateString("es-ES")}`
                : "";
            return (
                `MATRÍCULA SUSPENDIDA\n` +
                `Fecha de suspensión: ${state.suspensionDate.toLocaleDateString("es-ES")}\n` +
                `Motivo: ${state.suspensionReason}` + reincorporacion
            );
        }

        case "FINALIZADA": {
            const titulo = state.obtainedDegree
                ? `\nTitulación: ${state.obtainedDegree}`
                : "";
            return (
                `MATRÍCULA FINALIZADA\n` +
                `Fecha: ${state.endDate.toLocaleDateString("es-ES")}\n` +
                `Nota media: ${state.gradeAverage.toFixed(2)} / 10` + titulo
            );
        }

        default:
            return assertNever(
                state,
                `generarReporte: tipo de matrícula desconocido recibido → ${JSON.stringify(state)}`
            );
    }
}