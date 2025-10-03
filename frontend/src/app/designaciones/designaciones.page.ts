import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService, Designacion } from '../services/data-store.service';

@Component({
  selector: 'app-designaciones',
  standalone: false,
  templateUrl: './designaciones.page.html',
  styleUrls: ['./designaciones.page.scss']
})
export class DesignacionesPage implements OnInit {
  designaciones: Designacion[] = [];
  searchTerm = '';

  // computed stats
  totalDesignaciones = 0;
  designacionesEsteMes = 0;
  arbitrosActivos = 0;

  constructor(private store: DataStoreService, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.designaciones = this.store.getDesignaciones();
    this.computeStats();
  }

  nueva() { this.router.navigate(['designaciones', 'nueva']); }

  ver(id: string) { this.router.navigate(['designaciones', 'detalle'], { queryParams: { id } }); }
  editar(id: string) { this.router.navigate(['designaciones', 'editar'], { queryParams: { id } }); }

  get designacionesFiltradas() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.designacionesSorted;
    return this.designacionesSorted.filter(d => {
      const partidoLower = (d.partido || '').toLowerCase();
      const matchTeam = partidoLower.includes(term);
      const principalName = this.getArbitroNombre(d.arbitroPrincipalId).toLowerCase();
      return matchTeam || principalName.includes(term);
    });
  }

  get designacionesSorted() {
    return [...this.designaciones].sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  getArbitroNombre(arbitroId?: string) {
    if (!arbitroId) return 'N/A';
    const a = this.store.getArbitros().find(x => x.id === arbitroId);
    return a ? `${a.nombre} ${a.apellido || ''}`.trim() : 'N/A';
  }

  getCampeonatoInfo(campeonatoId?: string) {
    return undefined; // placeholder — original app had campeonatos in data-store
  }

  computeStats() {
    this.totalDesignaciones = this.designaciones.length;
    const hoy = new Date();
    this.designacionesEsteMes = this.designaciones.filter(d => {
      const f = new Date(d.fecha);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }).length;

    const set = new Set<string>();
    this.designaciones.forEach(d => {
      if (d.arbitroPrincipalId) set.add(d.arbitroPrincipalId);
      if (d.arbitroAsistente1Id) set.add(d.arbitroAsistente1Id);
      if (d.arbitroAsistente2Id) set.add(d.arbitroAsistente2Id);
      if (d.cuartoArbitroId) set.add(d.cuartoArbitroId);
    });
    this.arbitrosActivos = set.size;
  }
}
