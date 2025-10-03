import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesignacionesPage } from './designaciones.page';
import { NuevaDesignacionPage } from './nueva.page';
import { DesignacionDetailPage } from './designacion-detail.page';

const routes: Routes = [
  { path: '', component: DesignacionesPage },
  { path: 'nueva', component: NuevaDesignacionPage },
  // Use query params for detail/edit to avoid prerender requirements for param routes
  { path: 'detalle', component: DesignacionDetailPage },
  { path: 'editar', component: DesignacionDetailPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DesignacionesRoutingModule {}
