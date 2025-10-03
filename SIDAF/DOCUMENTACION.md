# DOCUMENTACIÓN CANÓNICA — Migración a Angular (SIDAF)

Última actualización: 26 de septiembre de 2025

Propósito
--------
Archivo único y canónico que contiene la documentación del proyecto y el seguimiento de la migración del frontend de `SIDAF-PUNO` a Angular dentro del repo `SIDAF`.

Resumen ejecutivo
------------------
- Objetivo principal: migrar el frontend de SIDAF-PUNO a Angular, comenzando por el módulo "Gestión de Árbitros" (Ver Árbitros y Nuevo Árbitro) como prueba de concepto.
- Estado actual: Módulo Árbitros migrado a Angular en `d:/SIDAF/frontend`. Errores críticos corregidos (NG6008, duplicados en plantilla). Proyecto listo para continuar con el resto de módulos.
# DOCUMENTACIÓN CANÓNICA — Migración a Angular (SIDAF)

Última actualización: 26 de septiembre de 2025

Propósito
--------
Este documento resume el trabajo de migración del frontend de `SIDAF-PUNO` a Angular, el estado actual del proyecto, decisiones técnicas, y las siguientes tareas prioritarias para retomar el trabajo.

Resumen ejecutivo (hoy)
-----------------------
- Objetivo: completar la migración del frontend a Angular, priorizando paridad funcional con la app original.
- Avance del día: mejoras importantes en el módulo `Árbitros` (Nuevo Árbitro) — interfaz rediseñada, avatar por iniciales, subida de imagen (preview), slider, switch, validaciones de formulario y experiencia de guardado con spinner/overlay.
- Estado: el proyecto compila y el dev server arranca correctamente. Los cambios están en `d:/SIDAF/frontend`.

Cambios realizados (resumen técnico)
----------------------------------
1) Módulo Árbitros — `Nuevo Árbitro` (mejoras UX/UI)
   - Reescritura del formulario con layout de dos columnas (avatar + campos).
   - Avatar por defecto generado con iniciales (SVG data URL) hasta que el usuario suba una foto.
   - Botón "Subir foto" con preview instantáneo (cliente) — implementación mínima y estable.
   - Slider para "Nivel de preparación" con visualización del %.
   - Switch estilizado para "Disponible".
   - Autofocus en `Nombre`, placeholders, y formato de teléfono al perder foco.
   - Spinner en botón crear/actualizar y overlay mientras persiste.
   - Estilos responsivos y mejoras de accesibilidad (labels, focus styles).

2) Servicios y utilidades
   - `DataStoreService` mantiene la persistencia local (arbitros, designaciones, campeonatos, etc.). Los objetos de árbitros pueden incluir ahora un campo opcional `avatar` (data URL) si se sube foto.
   - `ToastService` y `ToasterComponent` para notificaciones no bloqueantes (ya integrados en layout).
   - `PdfGeneratorService`, `DesignacionService`, `DesignacionMejoradoService` implementados/portados en `src/app/services/` (resumen previo en el repo).

3) Build y validación
   - Realicé builds repetidos durante las iteraciones; compilación final exitosa y salida en `dist/frontend`.
   - Se mantuvo cuidado con imports necesarios (`CommonModule`, `ReactiveFormsModule`) y guardias SSR para `localStorage`/`window`.

Archivos editados hoy (principales)
---------------------------------
- `src/app/arbitros-nuevo/arbitros-nuevo.component.html` — nuevo layout y upload minimal.
- `src/app/arbitros-nuevo/arbitros-nuevo.component.scss` — estilos del formulario, avatar, botones y responsive.
- `src/app/arbitros-nuevo/arbitros-nuevo.component.ts` — handlers para preview, formato teléfono, generación de avatar por iniciales.

Decisiones importantes
----------------------
- Avatar: generación mediante SVG data URL garantiza visual coherente y evita dependencias externas. Actualmente la foto se mantiene en memoria y se persiste como data URL en `DataStoreService` (si lo deseas, puedo cambiar esto para no persistir imágenes en localStorage).
- Simplificación deliberada: hoy se aplicó la implementación mínima y estable para subir foto (botón y preview). Puedo reactivar drag & drop y validaciones (máx. 2MB) si lo autoriza.
- Forms: usé `disabled` en atributos del DOM para bloquear inputs durante submit; Angular sugiere `FormControl.disable()`/`enable()` para evitar warnings — puedo refactorizar esto si lo prefieres.

Qué queda pendiente (prioridad inmediata)
----------------------------------------
1. Ejecutar pruebas manuales / smoke tests en entornos locales (crear → editar → eliminar árbitro). (Recomendado: hacer esto ahora como verificación rápida).
2. Decidir política de persistencia de imágenes (persistir data URL en `DataStoreService` vs no persistir y subir a backend más tarde).
3. Añadir validación de tamaño (2MB) y un botón "Quitar foto" (opcional, rápido).
4. Cambiar la desactivación de campos a través de `FormControl.disable()` para seguir la recomendación Angular (limpiar warnings).
5. Añadir tests unitarios y 1 e2e para `Arbitros` (create→edit→delete), y luego repetir para `Designaciones` y `Campeonatos`.

Notas para cuando retomemos
--------------------------
- Si vas a continuar mañana, recomiendо arrancar con:
  1) `cd d:/SIDAF/frontend`
  2) `npm run start` (esperar que aparezca `http://localhost:4200`)
  3) Abrir `http://localhost:4200/arbitros/nuevo` y seguir la prueba manual.
- Si deseas que ejecute la prueba de humo automáticamente, puedo hacerlo y reportar los pasos exactos y logs.

Resumen rápido de acciones sugeridas al volver (pick-one):
- (A) Agregar validación de tamaño + botón "Quitar foto" (rápido).
- (B) Refactor `disabled` → `FormControl.disable()` para eliminar advertencias de Angular.
- (C) Implementar tests unitarios + e2e para flujo `Arbitros`.

Estado del todo list (resumen):
- Árbitros: completado (incluye mejoras UI descritas).
- Designaciones / Asistencia / Campeonatos: implementaciones parciales en el repo — pendientes de pruebas y pulido.

— Fin del resumen —

Si quieres que deje algún detalle extra (por ejemplo, la lista completa de commits, o una sección 'Qué revisar' con screenshots recomendados), lo añado antes de que te vayas a descansar.
```ts

const html = this.pdf.generateAsistenciaHtml(asistencias, arbitros, fechaInicio, fechaFin)

