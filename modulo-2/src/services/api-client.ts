// ============================================================
//  SERVICIO DE DATOS GENÉRICO - api-client.ts
// ============================================================

/**
 * Wraps any API or database response with a consistent envelope.
 * The generic parameter T provides strong typing for the response payload,
 * so callers always know the exact shape of the data they receive.
 */
export interface RespuestaAPI<T> {
    data: T;
    status: number;
    message: string;
    timestamp: Date;
    error?: string;
}

/**
 * In-memory simulated database.
 * Each key represents an endpoint and its value is the collection of records
 * stored under that route.
 */
const baseDatosSimulada: Record<string, unknown[]> = {
    "/estudiantes": [
        {
            id: "e-001",
            dni: "12345678A",
            name: "Laura",
            surname: "García Martínez",
            email: "laura.garcia@uni.es",
            birthDate: new Date("2000-03-15"),
            grade: "Ingeniería Informática",
            joinedYear: 2022,
        },
        {
            id: "e-002",
            dni: "87654321B",
            name: "Carlos",
            surname: "Rodríguez Pérez",
            email: "carlos.rodriguez@uni.es",
            birthDate: new Date("1999-07-22"),
            grade: "Matemáticas",
            joinedYear: 2021,
        },
    ],
    "/asignaturas": [
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
        {
            id: "a-201",
            name: "Estructuras de Datos",
            credits: 6,
            course: 2,
            department: "Informática",
            mandatory: true,
        },
    ],
};

/**
 * Simulates the latency of a real network or database call using setTimeout.
 *
 * @param ms - Delay in milliseconds. Defaults to a random value between 100–400 ms
 *             to mimic realistic network variance.
 * @returns A promise that resolves after the specified delay.
 */
function simularLatencia(ms?: number): Promise<void> {
    const delay = ms ?? Math.floor(Math.random() * 300) + 100;
    return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Simulates a typed data-access client (API or database).
 *
 * All methods are generic so the return type is always known at the call site,
 * eliminating `any` casts and enforcing clear data contracts throughout the app.
 * Network latency is simulated via `setTimeout` and every method returns a
 * `Promise<RespuestaAPI<T>>` for a uniform response envelope.
 */
export class ApiClient {
    private readonly baseUrl: string;

    /**
     * @param baseUrl - Base URL of the API. Defaults to the university API origin.
     */
    constructor(baseUrl: string = "https://api.universidad.es") {
        this.baseUrl = baseUrl;
    }

    /**
     * Fetches a single resource by ID from the given endpoint.
     *
     * @param endpoint - Resource path (e.g. `"/estudiantes"`).
     * @param id       - Unique identifier of the record to retrieve.
     * @returns A promise resolving to the matched record.
     */
    async obtenerRecursoPorId<T>(
        endpoint: string,
        id: string
    ): Promise<RespuestaAPI<T>> {
        await simularLatencia();

        const collection = baseDatosSimulada[endpoint];

        if (!collection) {
            return {
                data: null as T,
                status: 404,
                message: `Endpoint '${endpoint}' no encontrado.`,
                timestamp: new Date(),
                error: "NOT_FOUND",
            };
        }

        const recurso = collection.find(
            (item) => (item as Record<string, unknown>)["id"] === id
        ) as T | undefined;

        if (!recurso) {
            return {
                data: null as T,
                status: 404,
                message: `Recurso con id '${id}' no encontrado en '${endpoint}'.`,
                timestamp: new Date(),
                error: "NOT_FOUND",
            };
        }

        return {
            data: recurso,
            status: 200,
            message: "Recurso obtenido correctamente.",
            timestamp: new Date(),
        };
    }

    /**
     * Fetches all records from the given endpoint.
     *
     * @param endpoint - Resource path (e.g. `"/asignaturas"`).
     * @returns A promise resolving to the full collection.
     */
    async obtenerRecurso<T>(endpoint: string): Promise<RespuestaAPI<T[]>> {
        await simularLatencia();

        const collection = baseDatosSimulada[endpoint];

        if (!collection) {
            return {
                data: [],
                status: 404,
                message: `Endpoint '${endpoint}' no encontrado en el servidor.`,
                timestamp: new Date(),
                error: "NOT_FOUND",
            };
        }

        return {
            data: collection as T[],
            status: 200,
            message: `${collection.length} registro(s) obtenidos de '${endpoint}'.`,
            timestamp: new Date(),
        };
    }

    /**
     * Simulates creating a new resource at the given endpoint.
     *
     * @param endpoint - Resource path where the record will be created.
     * @param payload  - The data for the new resource.
     * @returns A promise resolving to the newly created record.
     */
    async crearRecurso<T>(
        endpoint: string,
        payload: T
    ): Promise<RespuestaAPI<T>> {
        await simularLatencia(200);

        if (!baseDatosSimulada[endpoint]) {
            baseDatosSimulada[endpoint] = [];
        }

        baseDatosSimulada[endpoint].push(payload);

        return {
            data: payload,
            status: 201,
            message: `Recurso creado correctamente en '${endpoint}'.`,
            timestamp: new Date(),
        };
    }
}

export const apiClient = new ApiClient();