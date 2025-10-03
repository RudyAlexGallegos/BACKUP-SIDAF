import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AsistenciaService } from '../../services/asistencia.service';

@Component({
  selector: 'app-registro-asistencia-movil',
  templateUrl: './registro-asistencia-movil.page.html',
  styleUrls: ['./registro-asistencia-movil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RegistroAsistenciaMovilPage implements OnInit {
  arbitros: any[] = [];
  hoyKey: string;
  searchTerm = '';
  categoryFilter = 'Todas';
  categories: string[] = [];

  private actionStack: { id: string; prev: boolean }[] = [];

  // svc público para uso directo en la plantilla
  constructor(public svc: AsistenciaService, private router: Router) {
    this.hoyKey = String(this.svc.todayKey ? this.svc.todayKey() : new Date().toISOString().slice(0,10));
  }

  ngOnInit(): void { this.load(); }

  private normalize(a: any) {
    const telefono = a.telefono ?? a.phone ?? a.phoneNumber ?? a.phone_number ?? '';
    const email = a.email ?? a.correo ?? '';
    const avatar = a.avatar ?? a.photo ?? a.foto ?? '';
    const categoria = a.categoria ?? a.category ?? 'Nacional';
    const nombre = a.nombre ?? a.name ?? '';
    const apellido = a.apellido ?? a.lastName ?? a.lastname ?? '';
    const disponible = typeof a.disponible === 'boolean' ? a.disponible : (a.disponibilidad ?? a.available ?? true);
    const cargo = a.cargo ?? a.especialidad ?? a.role ?? '';
    return { ...a, telefono, email, avatar: avatar ? String(avatar) : '', categoria, nombre, apellido, disponible, cargo };
  }

  load(): void {
    const raw = (this.svc.getArbitros ? this.svc.getArbitros() : []) || [];
    this.arbitros = raw.map((x: any) => this.normalize(x));
    const set = new Set<string>();
    this.arbitros.forEach(a => set.add(a.categoria ?? 'Nacional'));
    this.categories = Array.from(set).sort();
  }

  filteredList(): any[] {
    const term = (this.searchTerm || '').toLowerCase().trim();
    return this.arbitros.filter(a => {
      const inCategory = this.categoryFilter === 'Todas' || (a.categoria ?? 'Nacional') === this.categoryFilter;
      const combined = `${a.nombre} ${a.apellido ?? ''} ${a.email ?? ''} ${a.telefono ?? ''}`.toLowerCase();
      const inTerm = !term || combined.includes(term);
      return inCategory && inTerm;
    });
  }

  private pushAction(id: string) {
    const prev = !!this.svc.hasAttendance?.(id, this.hoyKey);
    this.actionStack.push({ id, prev });
  }

  mark(id: string) { this.pushAction(id); this.svc.mark?.(id, this.hoyKey, true); this.load(); }
  unmark(id: string) { this.pushAction(id); this.svc.unmark?.(id, this.hoyKey); this.load(); }

  markAll() { this.filteredList().forEach(a => { this.pushAction(a.id); this.svc.mark?.(a.id, this.hoyKey, true); }); this.load(); }
  unmarkAll() { this.filteredList().forEach(a => { this.pushAction(a.id); this.svc.unmark?.(a.id, this.hoyKey); }); this.load(); }

  undo() {
    const last = this.actionStack.pop();
    if (!last) { alert('Nada que deshacer'); return; }
    if (last.prev) this.svc.mark?.(last.id, this.hoyKey, true); else this.svc.unmark?.(last.id, this.hoyKey);
    this.load();
  }

  exportCSV() {
    const rows = [['Nombre', 'Rol', 'Categoría', 'Email', 'Teléfono', 'Estado']];
    this.filteredList().forEach(a => {
      const estado = this.svc.hasAttendance?.(a.id, this.hoyKey) ? 'Presente' : 'Ausente';
      rows.push([`${a.nombre} ${a.apellido ?? ''}`.trim(), a.cargo ?? '', a.categoria ?? '', a.email ?? '', a.telefono ?? '', estado]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `asistencia_${this.hoyKey}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  openNuevo() { this.router.navigateByUrl('/arbitros/nuevo'); }
}