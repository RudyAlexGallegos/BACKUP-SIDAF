import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

@Injectable({ providedIn: 'root' })
export class PdfGeneratorService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  generateAsistenciaHtml(asistencias: any[], arbitros: any[], fechaInicio: Date, fechaFin: Date): string {
    // Portado de lib/pdf-generator.ts -> generar HTML sin side-effects de window
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte de Asistencia</title><style>body{font-family:Arial,sans-serif;margin:20px;color:#333}/* estilos reducidos */</style></head><body>` +
      `<div class="header"><h1>📋 Reporte de Asistencia</h1><p><strong>Período:</strong> ${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}</p></div>` +
      this._generateAsistenciaSummary(asistencias, arbitros) +
      this._generateAsistenciaTable(asistencias, arbitros) +
      this._generateAsistenciaByArbitro(asistencias, arbitros) +
      `<div class="footer">Sistema de Gestión de Árbitros - Reporte generado automáticamente</div></body></html>`
  }

  generateDesignacionesHtml(designaciones: any[], arbitros: any[], campeonatos: any[], fechaInicio: Date, fechaFin: Date): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte de Designaciones</title><style>body{font-family:Arial,sans-serif;margin:20px;color:#333}/* estilos reducidos */</style></head><body>` +
      `<div class="header"><h1>⚽ Reporte de Designaciones</h1><p><strong>Período:</strong> ${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}</p></div>` +
      this._generateDesignacionesSummary(designaciones, campeonatos) +
      this._generateDesignacionesTable(designaciones, arbitros, campeonatos) +
      `<div class="footer">Sistema de Gestión de Árbitros - Reporte generado automáticamente</div></body></html>`
  }

  // Download/print should only run in browser
  downloadHtmlAsPdf(htmlContent: string, filename: string) {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('PdfGeneratorService: downloadHtmlAsPdf called in non-browser environment')
      return
    }

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    } else {
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace('.pdf', '.html')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  exportDataAsJson(data: any, filename: string) {
    if (!isPlatformBrowser(this.platformId)) return
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // --- Internal helpers (compact versions of the original functions) ---
  private _generateAsistenciaSummary(asistencias: any[], arbitros: any[]): string {
    const totalAsistencias = asistencias.length
    const preparacionFisica = asistencias.filter((a) => a.tipoActividad === 'preparacion_fisica').length
    const entrenamientos = asistencias.filter((a) => a.tipoActividad === 'entrenamiento').length
    const arbitrosUnicos = new Set(asistencias.map((a) => a.arbitroId)).size
    return `<div class="summary"><div class="summary-card"><h3>${totalAsistencias}</h3><p>Total Asistencias</p></div><div class="summary-card"><h3>${preparacionFisica}</h3><p>Preparación Física</p></div><div class="summary-card"><h3>${entrenamientos}</h3><p>Entrenamientos</p></div><div class="summary-card"><h3>${arbitrosUnicos}</h3><p>Árbitros Participantes</p></div></div>`
  }

  private _generateAsistenciaTable(asistencias: any[], arbitros: any[]): string {
    const rows = asistencias
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .map((asistencia) => {
        const arbitro = arbitros.find((a) => a.id === asistencia.arbitroId)
        const fecha = new Date(asistencia.fecha)
        return `<tr><td>${fecha.toLocaleDateString('es-ES')}</td><td>${fecha.toLocaleDateString('es-ES', { weekday: 'long' })}</td><td>${arbitro?.nombre || 'N/A'}</td><td>${arbitro?.categoria || 'N/A'}</td><td>${asistencia.presente ? 'Presente' : 'Ausente'}</td><td>${asistencia.tipoActividad === 'preparacion_fisica' ? 'Preparación Física' : 'Entrenamiento'}</td><td>${asistencia.observaciones || '-'}</td></tr>`
      })
      .join('')

    return `<div class="table-container"><div class="table-title">📅 Registro Detallado de Asistencias</div><table><thead><tr><th>Fecha</th><th>Día</th><th>Árbitro</th><th>Categoría</th><th>Estado</th><th>Tipo Actividad</th><th>Observaciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
  }

  private _generateAsistenciaByArbitro(asistencias: any[], arbitros: any[]): string {
    const asistenciaPorArbitro = arbitros
      .map((arbitro) => {
        const asistenciasArbitro = asistencias.filter((a) => a.arbitroId === arbitro.id)
        const preparacionFisica = asistenciasArbitro.filter((a) => a.tipoActividad === 'preparacion_fisica').length
        const entrenamientos = asistenciasArbitro.filter((a) => a.tipoActividad === 'entrenamiento').length
        const total = asistenciasArbitro.length
        return { arbitro, preparacionFisica, entrenamientos, total, porcentaje: arbitros.length > 0 ? Math.round((total / (asistencias.length / arbitros.length)) * 100) : 0 }
      })
      .sort((a, b) => b.total - a.total)

    const rows = asistenciaPorArbitro
      .map((stats) => `<tr><td>${stats.arbitro.nombre}</td><td>${stats.arbitro.categoria}</td><td style="text-align:center">${stats.total}</td><td style="text-align:center">${stats.preparacionFisica}</td><td style="text-align:center">${stats.entrenamientos}</td><td style="text-align:center">${stats.porcentaje}%</td></tr>`)
      .join('')

    return `<div class="table-container"><div class="table-title">👥 Resumen por Árbitro</div><table><thead><tr><th>Árbitro</th><th>Categoría</th><th>Total</th><th>Prep. Física</th><th>Entrenamientos</th><th>% Participación</th></tr></thead><tbody>${rows}</tbody></table></div>`
  }

  private _generateDesignacionesSummary(designaciones: any[], campeonatos: any[]): string {
    const totalDesignaciones = designaciones.length
    const campeonatosActivos = new Set(designaciones.map((d) => d.campeonatoId)).size
    const arbitrosDesignados = new Set([
      ...designaciones.map((d) => d.arbitroPrincipal),
      ...designaciones.map((d) => d.arbitroAsistente1),
      ...designaciones.map((d) => d.arbitroAsistente2),
      ...designaciones.map((d) => d.cuartoArbitro),
    ]).size
    const promedioCalificacion = (designaciones.filter((d) => d.calificacion).reduce((sum, d) => sum + (d.calificacion || 0), 0) / (designaciones.filter((d) => d.calificacion).length || 1)) || 0
    return `<div class="summary"><div class="summary-card"><h3>${totalDesignaciones}</h3><p>Total Designaciones</p></div><div class="summary-card"><h3>${campeonatosActivos}</h3><p>Campeonatos</p></div><div class="summary-card"><h3>${arbitrosDesignados}</h3><p>Árbitros Designados</p></div><div class="summary-card"><h3>${promedioCalificacion.toFixed(1)}</h3><p>Calificación Promedio</p></div></div>`
  }

  private _generateDesignacionesTable(designaciones: any[], arbitros: any[], campeonatos: any[]): string {
    const rows = designaciones
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .map((designacion) => {
        const campeonato = campeonatos.find((c) => c.id === designacion.campeonatoId)
        const principal = arbitros.find((a) => a.id === designacion.arbitroPrincipal)
        const asistente1 = arbitros.find((a) => a.id === designacion.arbitroAsistente1)
        const asistente2 = arbitros.find((a) => a.id === designacion.arbitroAsistente2)
        const cuarto = arbitros.find((a) => a.id === designacion.cuartoArbitro)
        const fecha = new Date(designacion.fecha)
        return `<tr><td>${fecha.toLocaleDateString('es-ES')}</td><td>${designacion.equipoLocal} vs ${designacion.equipoVisitante}</td><td>${designacion.estadio}</td><td>${campeonato?.nombre || 'N/A'}</td><td>${campeonato?.nivelDificultad || 'N/A'}</td><td>${principal?.nombre || 'N/A'}</td><td>${asistente1?.nombre || 'N/A'}</td><td>${asistente2?.nombre || 'N/A'}</td><td>${cuarto?.nombre || 'N/A'}</td><td style="text-align:center">${designacion.calificacion || '-'}</td></tr>`
      })
      .join('')

    return `<div class="table-container"><div class="table-title">⚽ Registro Detallado de Designaciones</div><table><thead><tr><th>Fecha</th><th>Partido</th><th>Estadio</th><th>Campeonato</th><th>Dificultad</th><th>Árbitro Principal</th><th>Asistente 1</th><th>Asistente 2</th><th>Cuarto Árbitro</th><th>Calificación</th></tr></thead><tbody>${rows}</tbody></table></div>`
  }
}
