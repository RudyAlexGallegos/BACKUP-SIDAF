import { Injectable } from '@angular/core';

export interface Arbitro {
  id: string;
  nombre: string;
  apellido?: string;
  categoria?: string;
}

export interface Asistencia {
  id: string;
  arbitroId: string;
  fecha: string;
  presente: boolean;
  tipoActividad?: string;
}

@Injectable({ providedIn: 'root' })
export class DataStoreService {
  private readonly KEY = 'sidaf-data';

  private state = { arbitros: [] as Arbitro[], asistencias: [] as Asistencia[] };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) this.state = JSON.parse(raw);
    } catch (e) {
      this.state = { arbitros: [], asistencias: [] };
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.KEY, JSON.stringify(this.state));
  }

  loadData() {
    this.loadFromStorage();
  }

  getArbitros() { return this.state.arbitros; }
  getAsistencias() { return this.state.asistencias; }

  addAsistencia(as: Omit<Asistencia, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const asistencia: Asistencia = { ...as, id };
    this.state.asistencias.push(asistencia);
    this.saveToStorage();
  }
}
