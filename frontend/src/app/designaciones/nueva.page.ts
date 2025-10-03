import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '../services/data-store.service';
import { DesignacionService } from '../services/designacion.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-designaciones-nueva',
  standalone: false,
  templateUrl: './nueva.page.html',
  styleUrls: ['./nueva.page.scss']
})
export class NuevaDesignacionPage implements OnInit {
  partido = '';
  fecha = '';
  arbitroPrincipalId = '';
  campeonatoId = '';

  arbitros: any[] = [];
  campeonatos: any[] = [];

  constructor(private store: DataStoreService, private router: Router, private designService: DesignacionService, private toast: ToastService) {}

  ngOnInit() {
    this.arbitros = this.store.getArbitros();
    this.campeonatos = this.store.getCampeonatos ? this.store.getCampeonatos() : [];
  }

  guardar() {
  if (!this.partido || !this.fecha || !this.campeonatoId) { this.toast.toast({ title: 'Campos faltantes', description: 'Completa partido, fecha y campeonato', variant: 'destructive' }); return; }
    const d = {
      id: 'd-' + Math.random().toString(36).slice(2,9),
      partido: this.partido,
      fecha: new Date(this.fecha).toISOString(),
      arbitroPrincipalId: this.arbitroPrincipalId || '' ,
      campeonatoId: this.campeonatoId
    };
    this.store.addDesignacion(d as any);
  this.toast.toast({ title: 'Creada', description: 'Designación creada correctamente', variant: 'default' });
    this.router.navigate(['/designaciones']);
  }

  cancelar() { this.router.navigate(['/designaciones']); }

  asignacionAutomatica() {
    const partidoObj: any = { id: 'p-' + Date.now(), campeonatoId: this.campeonatoId, fecha: new Date(this.fecha || Date.now()), equipoLocal: 'Local', equipoVisitante: 'Visitante', estadio: '' };
    const campeonatoObj = this.campeonatos.find((c: any) => c.id === this.campeonatoId);
    const auto = this.designService.designarArbitros(partidoObj, campeonatoObj, this.arbitros as any[]);
  if (!auto) { this.toast.toast({ title: 'No se pudo asignar', description: 'No hay árbitros suficientes o calificados', variant: 'destructive' }); return; }
    const d = {
      id: auto.id,
      partido: this.partido || `${auto.partidoId || 'Partido'}`,
      fecha: new Date().toISOString(),
      arbitroPrincipalId: auto.arbitroPrincipal,
      arbitroAsistente1Id: auto.arbitroAsistente1,
      arbitroAsistente2Id: auto.arbitroAsistente2,
      cuartoArbitroId: auto.cuartoArbitro,
      campeonatoId: this.campeonatoId
    };
    this.store.addDesignacion(d as any);
  this.toast.toast({ title: 'Asignación automática', description: 'Designación creada automáticamente', variant: 'default' });
    this.router.navigate(['/designaciones']);
  }
}
