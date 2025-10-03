import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-asistencia-resumen',
  templateUrl: './asistencia-resumen.component.html',
  styleUrls: ['./asistencia-resumen.component.scss']
})
export class AsistenciaResumenComponent {
  @Input() presentes = 0;
  @Input() total = 0;
  get porcentaje() { return this.total ? Math.round((this.presentes / this.total) * 100) : 0; }
}