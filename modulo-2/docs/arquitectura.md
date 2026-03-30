# Documentación de Arquitectura — Módulo 2

## Índice

1. [Visión general](#visión-general)
2. [Modelo de datos](#modelo-de-datos)
    - [Entidad `Estudiante`](#entidad-estudiante)
    - [Entidad `Asignatura`](#entidad-asignatura)
    - [Unión discriminada `EstadoMatricula`](#unión-discriminada-estadomatricula)
3. [Servicio de datos genérico](#servicio-de-datos-genérico)
4. [Decisiones de diseño](#decisiones-de-diseño)
    - [`interface` vs `type`](#interface-vs-type)
    - [Por qué `readonly` en los IDs](#por-qué-readonly-en-los-ids)
    - [Por qué una unión discriminada](#por-qué-una-unión-discriminada)
    - [Por qué genéricos en `ApiClient`](#por-qué-genéricos-en-apiclient)
5. [Estructura de directorios](#estructura-de-directorios)

---

## Visión general

Este módulo modela el núcleo de un **sistema de gestión universitario** con TypeScript estricto. El objetivo es demostrar que el sistema de tipos no es solo documentación: es una herramienta que previene errores en tiempo de compilación antes de que lleguen a producción.

Se han aplicado tres patrones principales:

- **Interfaces de dominio** con propiedades `readonly` para proteger invariantes.
- **Uniones discriminadas** para modelar estados excluyentes con narrowing exhaustivo.
- **Genéricos** para abstraer la capa de acceso a datos sin perder información de tipos.

---

## Modelo de datos

### Entidad `Estudiante`

```ts
interface Estudiante {
  readonly dni: string;
  readonly id: string;
  name: string;
  surname: string;
  email: string;
  birthDate: Date;
  grade: string;
  joinedYear: number;
}
```

El `dni` y el `id` son `readonly` porque son identificadores que **nunca deben cambiar** tras la creación del objeto. Si el compilador permite reasignarlos, cualquier mutación accidental se convierte en un bug silencioso difícil de rastrear.

### Entidad `Asignatura`

```ts
interface Asignatura {
  readonly id: string;
  name: string;
  credits: number;
  course: 1 | 2 | 3 | 4;
  department: string;
  mandatory: boolean;
}
```

El campo `course` usa un **tipo literal de unión** (`1 | 2 | 3 | 4`) en lugar de `number`. Esto impide asignar un valor como `5` o `-1` sin que el compilador lo detecte. Es el tipo más estrecho posible para este dominio.

### Unión discriminada `EstadoMatricula`

```ts
type EstadoMatricula =
  | MatriculaActiva       // tipo: "ACTIVA"
  | MatriculaSuspendida   // tipo: "SUSPENDIDA"
  | MatriculaFinalizada   // tipo: "FINALIZADA"
```

Cada rama de la unión tiene su propio conjunto de propiedades. Esto es intencional: una matrícula activa tiene asignaturas pero no tiene nota media; una matrícula finalizada tiene nota media pero no tiene asignaturas. Mezclar esas propiedades en una sola interfaz con opcionales (`?`) sería un modelo incorrecto que permitiría estados inválidos como "activa con nota media".
 
---

## Servicio de datos genérico

```ts
interface RespuestaAPI<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
  error?: string;
}
 
class ApiClient {
  async obtenerRecurso<T>(endpoint: string): Promise<RespuestaAPI<T[]>> { ... }
  async obtenerRecursoPorId<T>(endpoint: string, id: string): Promise<RespuestaAPI<T>> { ... }
  async crearRecurso<T>(endpoint: string, payload: T): Promise<RespuestaAPI<T>> { ... }
}
```

El cliente no sabe nada de `Estudiante` ni de `Asignatura`. Solo sabe hablar con un servidor y devolver una respuesta envuelta. El tipo concreto lo decide el consumidor en el momento de la llamada.
 
---

## Decisiones de diseño

### `interface` vs `type`

Se han usado **`interface`** para todas las entidades de dominio (`Estudiante`, `Asignatura`, `MatriculaActiva`…) y **`type`** únicamente para la unión discriminada (`EstadoMatricula`).

**¿Por qué?**

| Criterio | `interface` | `type` |
|---|---|---|
| Extensible / merging | ✅ Sí (declaration merging) | ❌ No |
| Describe la forma de un objeto | ✅ Idiomático | ✅ Posible |
| Uniones y composición compleja | ❌ No puede | ✅ Necesario |
| Claridad de intención | Alta (es un contrato) | Alta (es una composición) |

Las `interface` comunican que estamos definiendo **un contrato para un objeto**. Son la herramienta canónica en TypeScript para describir entidades. Los `type` son la herramienta adecuada cuando necesitamos **combinar tipos** (uniones, intersecciones) o crear aliases de tipos complejos que no pueden expresarse con `interface`.

Usar `type` para todo mezcla semánticamente contratos de objetos con composiciones de tipos, reduciendo la legibilidad.

### Por qué `readonly` en los IDs

`readonly` convierte una propiedad en inmutable tras la inicialización del objeto. Los identificadores (`id`, `dni`) son invariantes de dominio: cambiarlos implicaría que el objeto ya no representa la misma entidad. Sin `readonly`, nada impide:

```ts
estudiante.dni = "00000000X"; // silencioso, no es un error de TS
```

Con `readonly`, el compilador rechaza esa asignación en tiempo de compilación, eliminando toda una categoría de bugs.

### Por qué una unión discriminada

Una matrícula puede encontrarse en tres estados **mutuamente excluyentes** con propiedades **propias de cada estado**. Una interfaz plana con opcionales habría sido:

```ts
// ❌ Modelo incorrecto: permite estados imposibles
interface Matricula {
  type: "ACTIVA" | "SUSPENDIDA" | "FINALIZADA";
  subjects?: Asignatura[];  // ¿Cuándo existe? ¿Solo si ACTIVA?
  reason?: string;             // ¿Solo si SUSPENDIDA?
  gradeAverage?: number;          // ¿Solo si FINALIZADA?
}
```

Con este diseño el compilador no puede ayudarnos. TypeScript no sabe que `gradeAverage` solo es relevante cuando `type === "FINALIZADA"`.

Con la unión discriminada, el narrowing en el `switch` es **exhaustivo y automático**:

```ts
switch (state.tipo) {
  case "ACTIVA":
    state.subjects; // TypeScript sabe que existe aquí
    break;
  case "FINALIZADA":
    state.gradeAverage;   // TypeScript sabe que existe aquí
    break;
}
```

Si en el Módulo 3 se añade un nuevo estado a la unión y no se actualiza el `switch`, el compilador puede emitir un error (mediante el patrón `never` de exhaustividad).

### Por qué genéricos en `ApiClient`

Sin genéricos, el cliente devolvería `any` o `unknown` y obligaría al consumidor a hacer castings manuales y potencialmente erróneos. Con genéricos:

```ts
// El tipo fluye de forma segura sin castings
const respuesta = await apiClient.obtenerRecurso<Estudiante>("/estudiantes");
respuesta.data[0].name; // ✅ TypeScript sabe que es string
respuesta.data[0].xyz;    // ❌ Error de compilación: la propiedad no existe
```

El genérico **no elimina información de tipo**: la propaga desde el punto de llamada hasta el tipo de retorno. Esto permite tener una sola implementación del cliente para cualquier entidad del sistema, manteniendo el contrato de tipos intacto en toda la cadena.
 
---

## Estructura de directorios

```
modulo-2/
├── docs/
│   └── arquitectura.md          ← Este documento
└── src/
    ├── index.ts                 ← Ejemplos de uso
    ├── types/
    │   └── universidad.ts   ← Entidades + unión discriminada + generarReporte
    └── services/
        └── api-client.ts        ← Cliente genérico + RespuestaAPI<T>
```