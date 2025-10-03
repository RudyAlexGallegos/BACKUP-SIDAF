import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/arbitros', pathMatch: 'full' },
  { path: 'arbitros', loadChildren: () => import('./arbitros-module').then(m => m.ArbitrosModule) },
  {
    path: 'asistencia',
    loadChildren: () => import('./asistencia/asistencia-module').then(m => m.AsistenciaModule)
  },
  { path: 'designaciones', loadChildren: () => import('./designaciones/designaciones-module').then(m => m.DesignacionesModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
