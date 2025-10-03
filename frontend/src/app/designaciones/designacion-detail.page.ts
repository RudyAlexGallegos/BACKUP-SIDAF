import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStoreService, Designacion } from '../services/data-store.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-designacion-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-6">
    <button class="btn btn-ghost mb-4" (click)="volver()">← Volver</button>

    <div *ngIf="!loaded">Cargando...</div>
    <div *ngIf="loaded && !designacion">Designación no encontrada</div>

    <div *ngIf="designacion">
    <h2 class="text-xl font-bold mb-4">{{ designacion.partido }}</h2>

    <div *ngIf="!editMode">
  <p><strong>Fecha:</strong> {{ designacion.fecha | date:'fullDate' }} {{ designacion.fecha | date:'shortTime' }}</p>
  <p><strong>Árbitro Principal:</strong> {{ getArbitroNombre(designacion.arbitroPrincipalId) }}</p>
        <div class="mt-4">
          <button class="btn btn-primary" (click)="enterEdit()">Editar</button>
          <button class="btn btn-danger ml-2" (click)="eliminar()">Eliminar</button>
        </div>
      </div>

      <div *ngIf="editMode">
        <div class="mb-2">
          <label class="block">Partido</label>
          <input class="w-full" [(ngModel)]="editModel.partido" />
        </div>
        <div class="mb-2">
          <label class="block">Fecha y hora</label>
          <input type="datetime-local" class="w-full" [(ngModel)]="editModel.fechaLocal" />
        </div>
        <div class="mb-2">
          <label class="block">Campeonato</label>
          <select class="w-full" [(ngModel)]="editModel.campeonatoId">
            <option [value]="''">-- Seleccionar campeonato --</option>
            <option *ngFor="let c of campeonatos" [value]="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div class="mb-2">
          <label class="block">Árbitro Principal</label>
          <select class="w-full" [(ngModel)]="editModel.arbitroPrincipalId">
            <option [value]="''">-- Seleccionar árbitro --</option>
            <option *ngFor="let a of arbitros" [value]="a.id">{{ a.nombre }} {{ a.apellido }}</option>
          </select>
        </div>
        <div class="mt-4">
          <button class="btn btn-primary" (click)="guardar()">Guardar</button>
          <button class="btn btn-outline ml-2" (click)="cancelEdit()">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class DesignacionDetailPage implements OnInit {
  id?: string;
  designacion?: Designacion | undefined;
  loaded = false;
  editMode = false;
  editModel: any = { partido: '', fechaLocal: '' };
  arbitros: any[] = [];
  campeonatos: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private store: DataStoreService, private toast: ToastService) {}

  ngOnInit() {
    // support both param and query param (we switched to query params elsewhere)
    this.id = this.route.snapshot.queryParamMap.get('id') || this.route.snapshot.paramMap.get('id') || undefined;
    if (!this.id) { this.loaded = true; return; }
    // load lists
    this.arbitros = this.store.getArbitros();
    this.campeonatos = this.store.getCampeonatos ? this.store.getCampeonatos() : [];
    const list = this.store.getDesignaciones();
    this.designacion = list.find(d => d.id === this.id);
    if (this.designacion) {
      // prepare edit model
      this.editModel.partido = this.designacion.partido;
      const dt = new Date(this.designacion.fecha);
      // local datetime input expects format yyyy-MM-ddTHH:mm
      const isoLocal = dt.toISOString().slice(0,16);
      this.editModel.fechaLocal = isoLocal;
      // optional fields
      this.editModel.campeonatoId = this.designacion.campeonatoId || '';
      this.editModel.arbitroPrincipalId = this.designacion.arbitroPrincipalId || '';
    }
    this.loaded = true;
  }

  getArbitroNombre(id?: string) { if (!id) return 'N/A'; const a = this.store.getArbitros().find(x => x.id === id); return a ? `${a.nombre} ${a.apellido || ''}`.trim() : 'N/A' }

  volver() { this.router.navigate(['/designaciones']); }
  enterEdit() { this.editMode = true; }
  cancelEdit() { this.editMode = false; }

  guardar() {
    if (!this.designacion) return;
    if (!this.editModel.partido || !this.editModel.fechaLocal) { this.toast.toast({ title: 'Campos faltantes', description: 'Completa partido y fecha' }); return; }
    if (!this.editModel.campeonatoId) { this.toast.toast({ title: 'Falta campeonato', description: 'Selecciona un campeonato' }); return; }
    if (!this.editModel.arbitroPrincipalId) { this.toast.toast({ title: 'Falta árbitro', description: 'Selecciona un árbitro principal' }); return; }
    const updated: Partial<Designacion> = {
      partido: this.editModel.partido,
      fecha: new Date(this.editModel.fechaLocal).toISOString(),
      campeonatoId: this.editModel.campeonatoId,
      arbitroPrincipalId: this.editModel.arbitroPrincipalId
    };
    this.store.updateDesignacion(this.designacion.id, updated);
    this.toast.toast({ title: 'Guardado', description: 'Designación actualizada' });
    this.editMode = false;
    // refresh
    this.designacion = this.store.getDesignaciones().find(d => d.id === this.designacion!.id);
  }

  eliminar() {
    if (!this.designacion) return;
    this.toast.toast({
      title: 'Confirmar eliminación',
      description: '¿Eliminar esta designación?',
      variant: 'destructive',
      confirmLabel: 'Confirmar',
      onConfirm: () => {
        this.store.deleteDesignacion(this.designacion!.id);
        this.toast.toast({ title: 'Eliminada', description: 'Designación eliminada' });
        this.router.navigate(['/designaciones']);
      }
    });
  }
}
