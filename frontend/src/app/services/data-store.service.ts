import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Arbitro {
  id: string;
  nombre: string;
  apellido: string; // ahora obligatorio para evitar errores de tipo en llamadas externas
  email?: string;
  telefono?: string;
  categoria?: string;
  especialidad?: string;
  nivelPreparacion?: number;
  experiencia?: number;
  fechaNacimiento?: string;
  fechaInicio?: string;
  idiomas?: string[];
  gradoInstruccion?: string;
  profesion?: string;
  disponible?: boolean;
  // aceptar también ArrayBuffer|null desde componentes; luego lo convertimos a string al guardar
  avatar?: string | ArrayBuffer | null;
}

// Amplío las interfaces para cubrir propiedades usadas en templates/TS
export interface Campeonato {
  id: string;
  nombre: string;
  fechaInicio?: string;
  fechaFin?: string;
  lugar?: string;
  nivelDificultad?: string;
  equipos?: number;
}

export interface Designacion {
  id: string;
  campeonatoId?: string;
  arbitroId?: string;
  // Hago `fecha` no opcional para evitar errores TS al construir Date(...)
  fecha: string;
  rol?: string;
  partido?: string;
  arbitroPrincipalId?: string;
  arbitroAsistente1Id?: string;
  arbitroAsistente2Id?: string;
  cuartoArbitroId?: string;
}

const ARBITROS_KEY = 'arbitros';
const CAMPEONATOS_KEY = 'campeonatos';
const DESIGNACIONES_KEY = 'designaciones';

@Injectable({ providedIn: 'root' })
export class DataStoreService {
  private _arbitros$ = new BehaviorSubject<Arbitro[]>(this.loadArbitros());
  readonly arbitros$ = this._arbitros$.asObservable();

  private loadArbitros(): Arbitro[] {
    try { return JSON.parse(localStorage.getItem(ARBITROS_KEY) || '[]') as Arbitro[]; } catch { return []; }
  }

  private saveArbitros(list: Arbitro[]) {
    // asegurar que avatar sea serializable a string antes de guardar
    const normalized = list.map(a => ({ ...a, avatar: a.avatar ? String(a.avatar) : '' }));
    localStorage.setItem(ARBITROS_KEY, JSON.stringify(normalized));
    this._arbitros$.next(normalized);
  }

  getArbitros(): Arbitro[] { return this._arbitros$.getValue(); }

  addArbitro(arbitro: Partial<Arbitro> & { id?: string }): Arbitro {
    const list = [...this.getArbitros()];
    const nuevo: Arbitro = {
      id: arbitro.id ?? `a-${Math.random().toString(36).slice(2,9)}`,
      nombre: arbitro.nombre ?? '',
      apellido: arbitro.apellido ?? '',
      email: arbitro.email ?? '',
      telefono: arbitro.telefono ?? '',
      categoria: arbitro.categoria ?? 'Nacional',
      especialidad: arbitro.especialidad ?? '',
      nivelPreparacion: arbitro.nivelPreparacion ?? 75,
      experiencia: arbitro.experiencia ?? 1,
      fechaNacimiento: arbitro.fechaNacimiento,
      fechaInicio: arbitro.fechaInicio,
      idiomas: Array.isArray(arbitro.idiomas) ? arbitro.idiomas : (arbitro.idiomas ? String(arbitro.idiomas).split(',').map(s=>s.trim()).filter(Boolean) : []),
      gradoInstruccion: arbitro.gradoInstruccion ?? '',
      profesion: arbitro.profesion ?? '',
      disponible: typeof arbitro.disponible === 'boolean' ? arbitro.disponible : true,
      // normalizar avatar a string (podía venir ArrayBuffer|null desde el componente)
      avatar: arbitro.avatar ? String(arbitro.avatar) : ''
    };
    list.push(nuevo);
    this.saveArbitros(list);
    return nuevo;
  }

  updateArbitro(id: string, updates: Partial<Arbitro>) {
    const normalizedUpdates = { ...updates, avatar: updates.avatar ? String(updates.avatar) : updates.avatar === undefined ? undefined : '' };
    const list = this.getArbitros().map(x => x.id === id ? { ...x, ...normalizedUpdates } : x);
    this.saveArbitros(list);
  }

  deleteArbitro(id: string) {
    const list = this.getArbitros().filter(x => x.id !== id);
    this.saveArbitros(list);
  }

  clearArbitros() { this.saveArbitros([]); }

  // --- Campeonatos (stubs compatibles con llamadas existentes) ---
  getCampeonatos(): Campeonato[] {
    try { return JSON.parse(localStorage.getItem(CAMPEONATOS_KEY) || '[]') as Campeonato[]; } catch { return []; }
  }
  addCampeonato(c: Partial<Campeonato> & { id?: string }) {
    const list = this.getCampeonatos();
    const nuevo: Campeonato = { id: c.id ?? `c-${Math.random().toString(36).slice(2,9)}`, nombre: c.nombre ?? 'Nuevo Campeonato', fechaInicio: c.fechaInicio, fechaFin: c.fechaFin, lugar: c.lugar, nivelDificultad: c.nivelDificultad, equipos: c.equipos ?? 0 };
    list.push(nuevo);
    localStorage.setItem(CAMPEONATOS_KEY, JSON.stringify(list));
    return nuevo;
  }
  updateCampeonato(id: string, updates: Partial<Campeonato>) {
    const list = this.getCampeonatos().map(x => x.id === id ? { ...x, ...updates } : x);
    localStorage.setItem(CAMPEONATOS_KEY, JSON.stringify(list));
  }
  deleteCampeonato(id: string) {
    const list = this.getCampeonatos().filter(x => x.id !== id);
    localStorage.setItem(CAMPEONATOS_KEY, JSON.stringify(list));
  }

  // --- Designaciones (stubs) ---
  getDesignaciones(): Designacion[] {
    try { return JSON.parse(localStorage.getItem(DESIGNACIONES_KEY) || '[]') as Designacion[]; } catch { return []; }
  }
  addDesignacion(d: Partial<Designacion> & { id?: string }) {
    const list = this.getDesignaciones();
    const nuevo: Designacion = { id: d.id ?? `d-${Math.random().toString(36).slice(2,9)}`, campeonatoId: d.campeonatoId, arbitroId: d.arbitroId, fecha: d.fecha ?? new Date().toISOString(), rol: d.rol, partido: d.partido, arbitroPrincipalId: d.arbitroPrincipalId, arbitroAsistente1Id: d.arbitroAsistente1Id, arbitroAsistente2Id: d.arbitroAsistente2Id, cuartoArbitroId: d.cuartoArbitroId };
    list.push(nuevo);
    localStorage.setItem(DESIGNACIONES_KEY, JSON.stringify(list));
    return nuevo;
  }
  updateDesignacion(id: string, updates: Partial<Designacion>) {
    const list = this.getDesignaciones().map(x => x.id === id ? { ...x, ...updates } : x);
    localStorage.setItem(DESIGNACIONES_KEY, JSON.stringify(list));
  }
  deleteDesignacion(id: string) {
    const list = this.getDesignaciones().filter(x => x.id !== id);
    localStorage.setItem(DESIGNACIONES_KEY, JSON.stringify(list));
  }
}
