# Migración Frontend SIDAF-PUNO → SIDAF (Angular)

Fecha: 26 de septiembre de 2025

Objetivo
--------
Migrar el frontend actual de `SIDAF-PUNO` (implementado originalmente en Next.js/React) a Angular, manteniendo la funcionalidad y la UX actuales, comenzando por el módulo "Gestión de Árbitros" (Ver Árbitros / Nuevo Árbitro) como prueba de concepto y patrón para el resto de módulos.

Resumen del avance
-------------------
- Se creó un proyecto Angular en `d:/SIDAF/frontend` y se migró el módulo de Árbitros.
- Se implementó `ArbitrosLista` y `ArbitrosNuevo` con formularios reactivos.
- Se corrigieron errores críticos de compilación (NG6008) y problemas de duplicidad en plantillas.
- Se agregó documentación de progreso en `d:/SIDAF/frontend/MIGRATION_PROGRESS.md` con detalle técnico y pasos de verificación.

Problemas detectados y soluciones aplicadas
-----------------------------------------
- NG6008 (componentes standalone declarados en NgModule) — Solución: asegurar componentes clásicos (no-standalone) y declarar correctamente en `ArbitrosModule`.
- Duplicidad en plantillas — Solución: limpiar duplicados en `arbitros-nuevo.component.html`.

Archivos clave
--------------
- `d:/SIDAF/frontend/src/app/arbitros-nuevo/*` — Componente Nuevo Árbitro (TS/HTML/SCSS).
- `d:/SIDAF/frontend/src/app/arbitros-lista/*` — Componente Lista de Árbitros.
- `d:/SIDAF/frontend/MIGRATION_PROGRESS.md` — Documento con todo el detalle del proceso y comandos.

Siguientes pasos recomendados (global)
-------------------------------------
1. Completar la migración de los demás módulos (Asistencia, Campeonatos, Designaciones, Reportes) siguiendo el patrón establecido.
2. Añadir tests unitarios y e2e para cada módulo migrado.
3. Documentar en el README del repo principal la estrategia (decisión sobre usar NgModules o standalone components para todo el proyecto).
4. Validar performance y optimizaciones SSR/SSG según sea necesario.

Cómo colaborar
--------------
- Revisar `MIGRATION_PROGRESS.md` en el proyecto Angular para detalles técnicos.
- Abrir issues o PRs en este repositorio con las migraciones de cada módulo.

---

Archivo de referencia: `d:/SIDAF/frontend/MIGRATION_PROGRESS.md`
