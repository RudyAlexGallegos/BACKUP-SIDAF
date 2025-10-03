import { Injectable } from '@angular/core';

export interface Arbitro { id: string; nombre: string; apellido: string; especialidad?: string }
export interface Asistencia { id: string; arbitroId: string; date: string; presente: boolean }

const ARBITROS_KEY = 'arbitros';
const ASISTENCIAS_KEY = 'asistencias';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  getArbitros(): Arbitro[] {
    const a = localStorage.getItem(ARBITROS_KEY);
    if (a) return JSON.parse(a);
    const seed: Arbitro[] = [
      { id:'a1', nombre:'Juan', apellido:'Perez', especialidad:'Central' },
      { id:'a2', nombre:'María', apellido:'Gonzalez', especialidad:'Asistente' },
      { id:'a3', nombre:'Carlos', apellido:'Lopez', especialidad:'Video' }
    ];
    localStorage.setItem(ARBITROS_KEY, JSON.stringify(seed));
    return seed;
  }

  getAllAsistencias(): Asistencia[] {
    const s = localStorage.getItem(ASISTENCIAS_KEY);
    return s ? JSON.parse(s) : [];
  }

  saveAllAsistencias(items: Asistencia[]) { localStorage.setItem(ASISTENCIAS_KEY, JSON.stringify(items)); }

  todayKey(d = new Date()): string {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
  }

  hasAttendance(arbitroId: string, dateKey?: string): boolean {
    const date = dateKey ?? this.todayKey();
    return this.getAllAsistencias().some(s => s.arbitroId === arbitroId && s.date === date && s.presente);
  }

  mark(arbitroId: string, dateKey?: string, presente = true) {
    const date = dateKey ?? this.todayKey();
    let all = this.getAllAsistencias().filter(s => !(s.arbitroId === arbitroId && s.date === date));
    all.push({ id: `${arbitroId}_${Date.now()}`, arbitroId, date, presente });
    this.saveAllAsistencias(all);
  }

  unmark(arbitroId: string, dateKey?: string) {
    const date = dateKey ?? this.todayKey();
    const all = this.getAllAsistencias().filter(s => !(s.arbitroId === arbitroId && s.date === date));
    this.saveAllAsistencias(all);
  }

  bulkMark(ids: string[], dateKey?: string, presente = true) {
    const date = dateKey ?? this.todayKey();
    let all = this.getAllAsistencias().filter(s => !(ids.includes(s.arbitroId) && s.date === date));
    ids.forEach(id => all.push({ id: `${id}_${Date.now()}`, arbitroId: id, date, presente }));
    this.saveAllAsistencias(all);
  }

  getAsistenciasInRange(from?: Date, to?: Date) {
    const all = this.getAllAsistencias();
    if (!from && !to) return all;
    const fromKey = from ? new Date(from.getFullYear(), from.getMonth(), from.getDate()).toDateString() : null;
    const toKey = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate()).toDateString() : null;
    return all.filter(r => {
      const key = new Date(r.date).toDateString();
      if (fromKey && key < fromKey) return false;
      if (toKey && key > toKey) return false;
      return true;
    });
  }

  clearAll() { localStorage.removeItem(ASISTENCIAS_KEY); }
}