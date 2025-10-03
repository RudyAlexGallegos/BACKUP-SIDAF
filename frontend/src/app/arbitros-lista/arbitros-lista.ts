

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '../services/data-store.service';
import { ToastService } from '../services/toast.service';

interface Arbitro {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  categoria: string;
  avatar?: string;
  especialidad?: string;
  experiencia?: number;
  fechaNacimiento?: string;
  fechaInicio?: string;
  idiomas?: string[];
  gradoInstruccion?: string;
  profesion?: string;
  disponible?: boolean;
  telefono?: string;
  // fechaNacimiento already declared above when available from data store
}

@Component({
  selector: 'app-arbitros-lista',
  standalone: false,
  templateUrl: './arbitros-lista.html',
  styleUrls: ['./arbitros-lista.scss']
})
export class ArbitrosLista implements OnInit   {
  constructor(private router: Router, private store: DataStoreService, private toast: ToastService) {}
  arbitros: Arbitro[] = [];
  searchTerm = '';
  filterCategoria = 'all';
  filterDisponibilidad = 'all';
  isLoading = true;
  selectedArbitro?: Arbitro | null = null;
  // UI state kept minimal for cards-only view

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading = true;
    try {
      const loaded = this.store.getArbitros();
      if (loaded && loaded.length) {
        // adapt to local shape if needed
        this.arbitros = loaded.map((a: any) => ({
          id: String(a.id),
          nombre: a.nombre,
          apellido: a.apellido,
          avatar: a.avatar,
          email: a.email,
          categoria: a.categoria || 'Nacional',
          especialidad: a.especialidad,
          experiencia: a.experiencia || 1,
          fechaNacimiento: a.fechaNacimiento,
          fechaInicio: a.fechaInicio,
          idiomas: Array.isArray(a.idiomas) ? a.idiomas : (a.idiomas ? String(a.idiomas).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          gradoInstruccion: (a as any).gradoInstruccion || (a as any).grado || undefined,
          profesion: (a as any).profesion || (a as any).ocupacion || undefined,
          disponible: typeof a.disponible === 'boolean' ? a.disponible : true,
          telefono: a.telefono,
          // fechaNacimiento assigned above if present
        }));
      } else {
        // fallback sample data
        this.arbitros = [
          { id: 'a1', nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos@email.com', categoria: 'FIFA', experiencia: 16, disponible: true, telefono: '999-111-222', fechaNacimiento: '1985-01-01' },
          { id: 'a2', nombre: 'Ana', apellido: 'Martínez', email: 'ana@email.com', categoria: 'Nacional', experiencia: 11, disponible: false, telefono: '999-333-444', fechaNacimiento: '1990-05-10' },
          { id: 'a3', nombre: 'Javier', apellido: 'Torres', email: 'javier@email.com', categoria: 'FIFA', experiencia: 18, disponible: true, telefono: '999-555-666', fechaNacimiento: '1982-09-15' },
        ];
      }
    } catch (e) {
      console.error('Error cargando árbitros', e);
      this.arbitros = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Devuelve la URL para el avatar: primero intenta la propiedad `avatar`,
   * y si no existe genera un SVG data-url con las iniciales.
   */
  getAvatar(arbitro: Arbitro): string {
    const anyA: any = arbitro as any;
    if (anyA.avatar) return anyA.avatar;
    const nombre = (arbitro.nombre || '').trim();
    const apellido = (arbitro.apellido || '').trim();
    const initials = ((nombre[0] || '') + (apellido[0] || '')).toUpperCase() || 'A';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='#2563eb' rx='12' ry='12'/><text x='50%' y='55%' font-size='28' font-family='sans-serif' fill='#fff' text-anchor='middle' dominant-baseline='middle'>${initials}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  get arbitrosFiltrados(): Arbitro[] {
    return this.arbitros.filter((arbitro) => {
      const matchesSearch =
        (arbitro.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          arbitro.apellido?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          arbitro.email?.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesCategoria = this.filterCategoria === 'all' || arbitro.categoria === this.filterCategoria;
      const matchesDisponibilidad =
        this.filterDisponibilidad === 'all' ||
        (this.filterDisponibilidad === 'disponible' && arbitro.disponible) ||
        (this.filterDisponibilidad === 'no-disponible' && !arbitro.disponible);
      return matchesSearch && matchesCategoria && matchesDisponibilidad;
    });
  }

  getCategoriaColor(categoria: string): string {
    switch (categoria) {
      case 'FIFA':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
      case 'Nacional':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'Primera Categoria':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
      case 'Segunda Categoria':
      case 'Tercera Categoria':
      case 'Aspirante':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  // calcula años desde fechaInicio (si existe)
  computeAniosDesdeInicio(fechaInicio?: string): number | null {
    if (!fechaInicio) return null;
    const inicio = new Date(fechaInicio);
    if (isNaN(inicio.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - inicio.getFullYear();
    const m = now.getMonth() - inicio.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < inicio.getDate())) years--;
    return Math.max(0, years);
  }

  getExperienciaLevel(experiencia?: number) {
    const exp = experiencia ?? 0;
    if (exp >= 15) return { label: 'Alta', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (exp >= 10) return { label: 'Alta', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (exp >= 5) return { label: 'Media', color: 'text-purple-700 bg-purple-50 border-purple-200' };
    return { label: 'Baja', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  }

  // Acciones reales conectadas al DataStore
  onNuevoArbitro() {
    this.router.navigate(['/arbitros/nuevo']);
  }
  onVerArbitro(arbitro: Arbitro) {
    // abrir el drawer de detalle con la información completa
    this.selectedArbitro = arbitro;
    // ensure any toasts are not intrusive
  }

  closeDetail() {
    this.selectedArbitro = null;
  }
  onEditarArbitro(arbitro: Arbitro) {
    this.router.navigate(['/arbitros/nuevo'], { queryParams: { id: arbitro.id } });
  }
  onEliminarArbitro(arbitro: Arbitro) {
    // show confirm toast with action
    this.toast.toast({
      title: 'Confirmar eliminación',
      description: `Eliminar árbitro ${arbitro.nombre}?`,
      variant: 'destructive',
      confirmLabel: 'Confirmar',
      onConfirm: () => {
        try {
          this.store.deleteArbitro(arbitro.id);
          this.load();
          this.toast.toast({ title: 'Eliminado', description: 'Árbitro eliminado' });
        } catch (e) {
          console.error('Error eliminando árbitro', e);
          this.toast.toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
        }
      }
    });
  }

  // UI helpers
  // UI helpers removed: cards-only view
}
