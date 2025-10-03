# Progreso de Migración — Módulo Árbitros (SIDAF-PUNO)

Fecha: 29 de septiembre de 2025

Resumen
-------
Este documento resume el avance técnico y funcional realizado durante la migración del módulo "Gestión de Árbitros" (Ver Árbitros y Nuevo Árbitro) desde la base original (`SIDAF-PUNO` en Next.js/React) hacia Angular.

Objetivo
--------
- Migrar la sección "Gestión de Árbitros" a Angular y dejar una implementación estable y extensible como patrón para los siguientes módulos.

Estado inicial
--------------
- Proyecto base: `d:/SIDAF/frontend` (Angular).
- Se detectaron problemas de duplicidad y errores de compilación en plantillas (NG6008, NG8103, TS template errors) originados por iteraciones previas y archivos duplicados.

Acciones realizadas (resumen)
----------------------------
1) Reproducción y diagnóstico inicial
   - Se ejecutó `ng serve` para capturar errores de compilación y reproducir el estado del proyecto.

2) Limpieza y normalización de componentes
   - Se eliminaron duplicados y se verificó que los componentes estén declarados correctamente en NgModules.
   - Se añadió una comprobación automatizada (`tools/check-standalone.js`) y una guía `DEV_GUIDELINES.md` para evitar mezclar estrategias (standalone vs NgModule).

3) Corrección de plantillas y tipos
   - Se corrigieron errores de plantilla (referencias potencialmente undefined) usando optional chaining y sanitizando bindings.

4) Reorganización y mejoras del formulario "Nuevo Árbitro"
   - Reescritura y limpieza de `arbitros-nuevo.component.html` para eliminar duplicados y agrupar campos.
   - Reorganización visual en secciones: Personal, Contacto, Formación/Profesión, Arbitraje.

5) Ampliación de datos y UX (iteración final)
   - Modelo y Formulario: añadidos `fechaNacimiento`, `fechaInicio`, `idiomas` (array), `gradoInstruccion`, `profesion` y `rendimiento` (estructura mínima) al `Arbitro`.
   - `Idiomas`: convertido a control multi-select con dropdown y checkboxes (`idiomasOptions`), evitando inputs de texto libre.
   - `gradoInstruccion` y `profesion`: convertidos a `<select>` con opciones predefinidas.
   - `Experiencia`: ahora se calcula automáticamente desde `fechaInicio` en tiempo real; la función `computeExperienceYears()` realiza el cálculo (conteo inclusivo, mínimo 1 año).
   - `Disponible`: toggle reubicado debajo del avatar (mejora de jerarquía visual).
   - Avatar: soporte para subir imagen con preview; si no hay imagen, se genera un SVG con iniciales.
   - Notificaciones: toasts informativos auto-descartan (2s), toasts destructivos requieren confirmación.
   - Botones: `Cancelar` y `Crear/Guardar` actualizados para usar clases estándar (`btn`, `btn-primary`, `btn-ghost`) y se añadieron reglas CSS locales para coherencia visual.

Archivos modificados / agregados (detallado)
------------------------------------------
- Modificados
  - `src/app/arbitros-nuevo/arbitros-nuevo.component.ts`
    - Añadidos controles de formulario para los nuevos campos, helpers para idiomas, suscripción a `fechaInicio` y `computeExperienceYears()`.

  - `src/app/arbitros-nuevo/arbitros-nuevo.component.html`
    - Reorganización del formulario; dropdown con checkboxes para `idiomas`; `experiencia` readonly calculado; toggle `disponible` movido al `aside` del avatar; botones estandarizados.

  - `src/app/arbitros-nuevo/arbitros-nuevo.component.scss`
    - Estilos visuales y reglas para avatar, switch y botones (`.btn`, `.btn-primary`, `.btn-ghost`).

  - `src/app/arbitros-lista/arbitros-lista.ts`
    - Helper `computeAniosDesdeInicio()` y mapping extendido para nuevos campos en el drawer.

  - `src/app/arbitros-lista/arbitros-lista.html`
    - Drawer actualizado para mostrar `Fecha de inicio`, `Años en arbitraje`, `Idiomas`, `Grado` y `Profesión`.

- Agregados / herramientas
  - `tools/check-standalone.js` — script para detectar `standalone: true` bajo `src/app`.
  - `DEV_GUIDELINES.md` — pautas de generación y estilo para componentes/modulos.

Verificaciones realizadas
-----------------------
- Corregidos errores de plantilla (TS2532) usando optional chaining.
- Evitado ID duplicados (por ejemplo, `disponible` ahora aparece una sola vez).
- Pruebas manuales sugeridas (ver sección siguiente).

Pruebas manuales sugeridas
-------------------------
1. Ejecutar `ng serve` desde la raíz del proyecto (`d:\SIDAF\frontend`).
2. Abrir `http://localhost:4200` y navegar a "Gestión de Árbitros" → "+ Nuevo Árbitro".
3. Verificar que el formulario aparece una sola vez y que los grupos (Personal / Contacto / Formación / Arbitraje) están presentes.
4. Subir una foto y confirmar preview; cuando no haya foto, verificar que se genera el avatar SVG con iniciales.
5. Seleccionar `fechaInicio` y comprobar que `Experiencia (años)` se actualiza inmediatamente.
6. Seleccionar varios `idiomas` desde el dropdown y comprobar persistencia tras guardar.
7. Guardar el árbitro y abrir su drawer en la lista para comprobar los nuevos campos.

Notas y recomendaciones
----------------------
- El cálculo de experiencia usa conteo inclusivo (inicio = año 1). Si se desea comportamiento distinto (0 hasta cumplirse 1 año), la función `computeExperienceYears()` puede modificarse.
- Si los estilos de botones se ven distintos en tiempo de ejecución, puede deberse a reglas CSS globales que prevalecen; se recomienda revisar el orden de carga de estilos en `angular.json` o aplicar selectores más específicos en el SCSS del componente.

Próximos pasos recomendados
--------------------------
1. Ejecutar pruebas unitarias básicas del componente (crear spec que verifique inicialización del formulario y lógica de `computeExperienceYears`).
2. Revisar otros módulos por duplicidades y por la presencia accidental de `standalone: true` si se generaron componentes con otras configuraciones.
3. Opcional: migrar gradualmente a componentes standalone como estrategia futura, pero hacerlo de forma completa y consistente.

Contacto
--------
Si hay dudas, dejar un issue en el repo o contactar al equipo frontend.

---

Fin del documento.
