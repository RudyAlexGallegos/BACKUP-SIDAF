import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataStoreService, Campeonato } from '../services/data-store.service';
import { ToastService } from '../services/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-campeonatos',
  template: `
  <div class="p-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Gestión de Campeonatos</h2>
      <button class="btn btn-primary" (click)="nuevo()">Nuevo Campeonato</button>
    </div>
    <div class="mt-4">
      <ul>
        <li *ngFor="let c of campeonatos" class="p-2 border rounded mb-2 flex justify-between items-center">
          <div>
            <div class="font-semibold">{{ c.nombre }}</div>
            <div class="text-sm text-gray-600">Nivel: {{ c.nivelDificultad }} · Equipos: {{ c.equipos }}</div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost" (click)="editar(c.id)">Editar</button>
            <button class="btn btn-danger" (click)="eliminar(c.id)">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
  `
})
export class CampeonatosPage implements OnInit {
  campeonatos: Campeonato[] = [];
  constructor(private store: DataStoreService, private router: Router, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.campeonatos = this.store.getCampeonatos(); }
  nuevo() { this.router.navigate(['/campeonatos/nuevo']); }
  editar(id: string) { this.router.navigate(['/campeonatos/nuevo'], { queryParams: { id } }); }
  eliminar(id: string) {
    this.toast.toast({
      title: 'Confirmar eliminación',
      description: 'Eliminar campeonato?',
      variant: 'destructive',
      confirmLabel: 'Confirmar',
      onConfirm: () => { this.store.deleteCampeonato(id); this.load(); }
    });
  }
}
