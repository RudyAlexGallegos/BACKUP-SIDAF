import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CampeonatosPage } from './campeonatos.page';
import { NuevoCampeonatoPage } from './nuevo.page';

const routes: Routes = [
  { path: '', component: CampeonatosPage },
  { path: 'nuevo', component: NuevoCampeonatoPage }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    CampeonatosPage,
    NuevoCampeonatoPage,
  ],
})
export class CampeonatosModule {}
