import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ControlAsistenciaPage } from './asistencia/control-asistencia.page';
import { EstadisticasAsistenciaPage } from './estadistica/estadisticas-asistencia.page';
import { RegistroAsistenciaPage } from './registro-asistencia/registro-asistencia.page';
import { RegistroAsistenciaMovilPage } from './registro-asistencia-movil/registro-asistencia-movil.page';

const routes: Routes = [
  { path: '', component: ControlAsistenciaPage },
  { path: 'registro', component: RegistroAsistenciaPage },
  { path: 'registro-movil', component: RegistroAsistenciaMovilPage },
  { path: 'estadisticas', component: EstadisticasAsistenciaPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsistenciaRoutingModule {}