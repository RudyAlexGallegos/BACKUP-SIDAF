import { ArbitrosNuevoComponent } from './arbitros-nuevo/arbitros-nuevo.component';
// Eliminado para limpieza total
// Eliminado para limpieza total

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { ArbitrosRoutingModule } from './arbitros-routing-module';
import { Arbitros } from './arbitros';
import { ArbitrosLista } from './arbitros-lista/arbitros-lista';




@NgModule({
  declarations: [
  Arbitros,
  ArbitrosLista,
  ArbitrosNuevoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ArbitrosRoutingModule
  ]
})
export class ArbitrosModule { }
