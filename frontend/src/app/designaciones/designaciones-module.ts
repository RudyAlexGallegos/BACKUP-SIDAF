import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DesignacionesRoutingModule } from './designaciones-routing-module';
import { DesignacionesPage } from './designaciones.page';
import { NuevaDesignacionPage } from './nueva.page';
import { DesignacionDetailPage } from './designacion-detail.page';

@NgModule({
  declarations: [DesignacionesPage, NuevaDesignacionPage],
  imports: [CommonModule, FormsModule, DesignacionesRoutingModule]
})
export class DesignacionesModule {}
