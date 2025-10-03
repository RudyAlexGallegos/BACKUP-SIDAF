import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaRoutingModule } from './asistencia-routing-module';

// componentes (si son standalone deben ir en imports; si no son standalone, el compilador pedirá que los movamos a declarations)
import { ControlAsistenciaPage } from './asistencia/control-asistencia.page';
import { EstadisticasAsistenciaPage } from './estadistica/estadisticas-asistencia.page';
import { RegistroAsistenciaPage } from './registro-asistencia/registro-asistencia.page';
import { RegistroAsistenciaMovilPage } from './registro-asistencia-movil/registro-asistencia-movil.page';
import { AsistenciaResumenComponent } from './asistencia-resumen/asistencia-resumen.component';
import { CalendarioAsistenciaComponent } from './calendario-asistencia/calendario-asistencia.component';

@NgModule({
  declarations: [], // no declarar componentes standalone
  imports: [
    CommonModule,
    FormsModule,
    AsistenciaRoutingModule,
    // importar aquí los componentes standalone
    ControlAsistenciaPage,
    EstadisticasAsistenciaPage,
    RegistroAsistenciaPage,
    RegistroAsistenciaMovilPage,
    AsistenciaResumenComponent,
    CalendarioAsistenciaComponent
  ]
})
export class AsistenciaModule {}