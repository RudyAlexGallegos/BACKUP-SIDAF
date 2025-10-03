import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArbitrosLista } from './arbitros-lista/arbitros-lista';
import { ArbitrosNuevoComponent } from './arbitros-nuevo/arbitros-nuevo.component';

const routes: Routes = [
  {
    path: 'arbitros',
    children: [
      { path: '', component: ArbitrosLista },
      { path: 'nuevo', component: ArbitrosNuevoComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArbitrosRoutingModule {}