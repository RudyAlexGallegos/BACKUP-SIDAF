import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService, Arbitro } from '../../services/asistencia.service';
import { exportToCsv } from '../../utils/csv';

@Component({
  selector: 'app-control-asistencia',
  templateUrl: './control-asistencia.page.html',
  styleUrls: ['./control-asistencia.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ControlAsistenciaPage implements OnInit {
  hoy = new Date();
  arbitros: Arbitro[] = [];
  sharedSearchTerm = '';
  // bind input[type=date] como string (yyyy-mm-dd)
  filterFrom?: string;
  filterTo?: string;
  lastAction: any = null;

  constructor(public svc: AsistenciaService) {}

  ngOnInit(): void {
    this.arbitros = this.svc.getArbitros();
  }

  filteredList(): Arbitro[] {
    const term = (this.sharedSearchTerm || '').toLowerCase().trim();
    return this.arbitros.filter(a => (`${a.nombre} ${a.apellido} ${a.categoria||''} ${a.cargo||''}`).toLowerCase().includes(term));
  }

  hasAttendance(aid: string): boolean { return this.svc.hasAttendance(aid, this.svc.todayKey(this.hoy)); }

  mark(aid: string) { const dateKey = this.svc.todayKey(this.hoy); this.svc.mark(aid, dateKey, true); this.lastAction = { type: 'mark', ids: [aid], date: dateKey }; }

  unmark(aid: string) { const dateKey = this.svc.todayKey(this.hoy); this.svc.unmark(aid, dateKey); this.lastAction = { type: 'unmark', ids: [aid], date: dateKey }; }

  bulkMarkAll(presente = true) {
    const ids = this.filteredList().map(x => x.id);
    const dateKey = this.svc.todayKey(this.hoy);
    this.svc.bulkMark(ids, dateKey, presente);
    this.lastAction = { type: 'bulk', ids, date: dateKey, presente };
  }

  undoLast() {
    if (!this.lastAction) return;
    const la = this.lastAction;
    if (la.type === 'bulk' || la.type === 'mark') {
      // ...se obtiene 'all' como array de {date,id,present}...
      const all = this.svc.getAllAsistencias().filter((s: any) => !(la.ids.includes(s.date) && s.date === la.date));
      // convertir array a estructura esperada por saveAllAsistencias
      const mapAll = all.reduce((acc: Record<string, Record<string, boolean>>, r: any) => {
        acc[r.date] = acc[r.date] || {};
        acc[r.date][r.id] = !!r.present;
        return acc;
      }, {});
      // guardar la estructura correcta
      this.svc.saveAllAsistencias(mapAll);
    }
    this.lastAction = null;
  }

  exportCsvRange() {
    const fromDate = this.filterFrom ? new Date(this.filterFrom) : undefined;
    const toDate = this.filterTo ? new Date(this.filterTo) : undefined;
    const rows = this.svc.getAsistenciasInRange(fromDate, toDate).map((r: any) => ({
      id: r.id, arbitroId: r.arbitroId, date: r.date, presente: r.presente ? '1' : '0'
    }));
    exportToCsv('asistencias_export.csv', rows);
  }

  // nueva acción: pedir asistencia (simulación)
  requestAssistance(aid: string) {
    const a = this.arbitros.find(x => x.id === aid);
    console.log('Solicitud de asistencia enviada para', aid, a);
    alert(`Solicitud de asistencia enviada a ${a?.nombre} ${a?.apellido}`);
    this.lastAction = { type: 'request', ids: [aid], date: this.svc.todayKey(this.hoy) };
  }

  trackBy(_: number, item: Arbitro) { return item.id; }
}