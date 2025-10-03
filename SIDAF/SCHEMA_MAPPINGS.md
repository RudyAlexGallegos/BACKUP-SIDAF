# Esquema de mapeo a Angular — SIDAF

Fecha: 26-09-2025
Propósito: describir las funciones, entradas/salidas, contratos y notas SSR/DOM para portar las piezas críticas del frontend original (SIDAF-PUNO) a Angular en `d:/SIDAF/frontend`.

Contenido:
- Contratos y firmas (DataStore, DesignacionService, PdfGeneratorService, ToastService)
- Componentes clave y props equivalentes
- Casos borde y validaciones recomendadas
- Tests recomendados y checklist de PR

---

## 1) DataStoreService (contrato y métodos)

Descripción: fuente de verdad en el cliente usando `localStorage` con guardias SSR.
Firmas principales:
- getArbitros(): Arbitro[]
- addArbitro(item: Arbitro): void
- updateArbitro(id: string, updates: Partial<Arbitro>): void
- deleteArbitro(id: string): void

- getAsistencias(): AsistenciaRecord[]
- addAsistencia(r: AsistenciaRecord): void
- updateAsistencia(id: string, updates: Partial<AsistenciaRecord>): void
- removeAsistencia(id: string): void

- getDesignaciones(): Designacion[]
- addDesignacion(d: Designacion): void
- updateDesignacion(id: string, updates: Partial<Designacion>): void
- deleteDesignacion(id: string): void

- getCampeonatos(): Campeonato[]
- addCampeonato(c: Campeonato): void
- updateCampeonato(id: string, updates: Partial<Campeonato>): void
- deleteCampeonato(id: string): void

Notas:
- Todos los métodos deben comprobar `typeof window !== 'undefined'` antes de acceder a `localStorage`.
- Evitar devolver referencias mutables: retornar copias (e.g., JSON.parse(JSON.stringify(...))) cuando sea necesario.

---

## 2) DesignacionService / DesignacionMejoradoService

Contrato básico:
- designarArbitros(partido: string, campeonatoId: string, arbitros: Arbitro[], options?: any): Designacion | null
- evaluarCalidadDesignacion(des: Designacion, arbitros: Arbitro[]): number

Mejorado (usa asistencias):
- designarArbitrosMejorado(partido: string, campeonatoId: string, arbitros: Arbitro[], asistencias: AsistenciaRecord[]): Designacion | null
- obtenerRecomendacionesAsistencia(arbitroId: string, asistencias: AsistenciaRecord[]): string[]

Edge cases:
- Si hay menos árbitros disponibles que plazas requeridas → devuelve `null` y muestra error en UI.
- Empates: aplicar criterio secundario (última asistencia, categoría).

Tests sugeridos:
- Caso con 0 árbitros, menos de 4, exactamente 4, y >4.
- Empate de puntaje.

---

## 3) PdfGeneratorService

Firmas:
- generateAsistenciaHtml(asistencias: AsistenciaRecord[], arbitros: Arbitro[], fechaInicio?: Date, fechaFin?: Date): string
- downloadHtmlAsPdf(html: string, filename: string): void
- exportDataAsJson(data: any, filename: string): void

Notas:
- Separar: generación de contenido (pura) y efectos de DOM (download/print). Usar `isPlatformBrowser` para proteger effect calls.

---

## 4) ToastService

Contrato:
- toast(payload: { title: string; description?: string; variant?: 'success'|'danger'|'info' }): string // returns id
- dismiss(id: string): void
- toasts$: Observable<ToastItem[]>

UI:
- ToasterComponent se suscribe a `toasts$` y renderiza.

---

## 5) Componentes y páginas (mapeo rápido)

- `ArbitrosModule`:
  - `ArbitrosListComponent` (lista, filtro)
  - `ArbitrosFormComponent` (crear/editar)

- `AsistenciaModule`:
  - `AsistenciaPage` (desktop/mobile)
  - `RegistroAsistenciaComponent`
  - `DatePickerComponent` (standalone)

- `DesignacionesModule`:
  - `DesignacionesPage` (lista)
  - `DesignacionesNuevaPage` (form)
  - `DesignacionDetailPage` (detalle/editar)

Recomendación: usar `FormsModule` para bindings simples y `ReactiveFormsModule` para formularios complejos (validaciones, selects con búsqueda).

---

## 6) Validaciones y UX recomendadas

- Fecha: comprobar ISO y que sea una fecha futura cuando aplique.
- Partido: non-empty string, longitud mínima 3.
- Selector de árbitros: evitar que el mismo árbitro sea seleccionado en más de una plaza.
- Confirmación al eliminar (modal).

---

## 7) Tests y CI checklist

- Unit tests para servicios (DataStore, Designacion, PdfGenerator).
- Unit tests para componentes críticos (DesignacionDetail guardar/eliminar).
- E2E mínimo: crear → editar → eliminar designación.
- Lint y build deben pasar. Añadir un job en CI que haga `npm run build` y `npm test`.

---

## 8) Próximos pasos (priorizados)

1. Completar migración de `Designaciones.nueva` con integración de `DesignacionService` para asignación automática. (2–3h)
2. Añadir select con búsqueda para árbitros (si hay >30) — usar `ngx-select` o componente propio. (1–2h)
3. Escribir tests unitarios para `DesignacionService`. (1–2h)
4. Añadir e2e pipeline. (2–4h)

---

Fin del esquema de mapeo.
