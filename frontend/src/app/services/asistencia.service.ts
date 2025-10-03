import { Injectable, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export interface Arbitro {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  categoria?: string;
  especialidad?: string;
  disponible?: boolean;
  avatar?: string;
  cargo?: string; // agregado para evitar errores al leer a.cargo
}

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly ASIST_KEY = 'asistencia';
  private readonly ARBITROS_KEY = 'arbitros';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // devuelve clave YYYY-MM-DD
  todayKey(d?: Date | string): string {
    const date = d ? (typeof d === 'string' ? new Date(d) : d) : new Date();
    return date.toISOString().slice(0, 10);
  }

  // -- Arbitros --
  getArbitros(): Arbitro[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(this.ARBITROS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Arbitro[];
    } catch {
      return [];
    }
  }

  // -- Asistencias (estructura interna: { [dateKey]: { [arbitroId]: boolean } }) --
  private loadAll(): Record<string, Record<string, boolean>> {
    if (!this.isBrowser()) return {};
    try {
      const s = localStorage.getItem(this.ASIST_KEY) || '{}';
      return JSON.parse(s);
    } catch {
      return {};
    }
  }

  // devuelve todas las asistencias como array { date, id, present }
  getAllAsistencias(): { date: string; id: string; present: boolean }[] {
    const all = this.loadAll();
    const rows: { date: string; id: string; present: boolean }[] = [];
    for (const dateKey of Object.keys(all)) {
      const map = all[dateKey] || {};
      for (const id of Object.keys(map)) {
        rows.push({ date: dateKey, id, present: !!map[id] });
      }
    }
    return rows;
  }

  saveAllAsistencias(obj: Record<string, Record<string, boolean>>) {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.ASIST_KEY, JSON.stringify(obj));
    } catch { /* ignore */ }
  }

  hasAttendance(id: string, key?: string): boolean {
    if (!this.isBrowser()) return false;
    const k = key ?? this.todayKey();
    try {
      const all = this.loadAll();
      return !!(all[k] && all[k][id]);
    } catch {
      return false;
    }
  }

  mark(id: string, key?: string, present = true) {
    if (!this.isBrowser()) return;
    const k = key ?? this.todayKey();
    const all = this.loadAll();
    all[k] = all[k] || {};
    all[k][id] = !!present;
    this.saveAllAsistencias(all);
  }

  unmark(id: string, key?: string) {
    if (!this.isBrowser()) return;
    const k = key ?? this.todayKey();
    const all = this.loadAll();
    if (all[k] && all[k][id] !== undefined) {
      delete all[k][id];
      this.saveAllAsistencias(all);
    }
  }

  // marcar/desmarcar en lote
  bulkMark(ids: string[], key?: string, present = true) {
    if (!this.isBrowser()) return;
    const k = key ?? this.todayKey();
    const all = this.loadAll();
    all[k] = all[k] || {};
    ids.forEach(id => { all[k][id] = !!present; });
    this.saveAllAsistencias(all);
  }

  // devuelve asistencias entre fechas (inclusive) como array de { date, id, present }
  // ahora acepta from/to undefined (devuelve [] si faltan)
  getAsistenciasInRange(from?: Date | string, to?: Date | string) {
    if (!from || !to) return [];
    const fromD = typeof from === 'string' ? new Date(from) : from;
    const toD = typeof to === 'string' ? new Date(to) : to;
    const all = this.loadAll();
    const rows: { date: string; id: string; present: boolean }[] = [];
    for (const dateKey of Object.keys(all)) {
      const d = new Date(dateKey);
      if (isNaN(d.getTime())) continue;
      if (d >= fromD && d <= toD) {
        const map = all[dateKey] || {};
        for (const id of Object.keys(map)) {
          rows.push({ date: dateKey, id, present: !!map[id] });
        }
      }
    }
    return rows;
  }
}