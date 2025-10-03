
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataStoreService } from '../services/data-store.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-arbitros-nuevo',
  standalone: false,
  templateUrl: './arbitros-nuevo.component.html',
  styleUrls: ['./arbitros-nuevo.component.scss']
})
export class ArbitrosNuevoComponent implements OnInit {
  arbitroForm: FormGroup;
  isSubmitting = false;
  isEdit = false;
  currentId?: string;
  avatarPreview?: string | ArrayBuffer | null;
  computedInitials?: string;

  categorias = [
    { value: 'FIFA', label: 'FIFA' },
    { value: 'Nacional', label: 'Nacional' },
    { value: 'Primera Categoria', label: 'Primera Categoria' },
    { value: 'Segunda Categoria', label: 'Segunda Categoria' },
    { value: 'Tercera Categoria', label: 'Tercera Categoria' },
    { value: 'Aspirante', label: 'Aspirante' }
  ];

  especialidades = [
    { value: 'Principal', label: 'Árbitro Principal' },
    { value: 'Asistente', label: 'Árbitro Asistente' },
    { value: 'VAR', label: 'VAR' },
    { value: 'AVAR', label: 'AVAR' }
  ];

  // Options for fields where user should choose, not free text
  idiomasOptions = ['Español', 'Inglés', 'Quechua', 'Aymara', 'Portugués', 'Francés'];
  gradoOptions = ['Sin estudio', 'Primaria', 'Secundaria', 'Técnico', 'Bachiller', 'Licenciado', 'Magíster', 'Doctor'];
  profesionOptions = ['Profesor', 'Administrador Deportivo', 'Estudiante', 'Abogado', 'Médico', 'Ingeniero', 'Otro'];
  idiomasOpen = false;

  constructor(private fb: FormBuilder, private router: Router, private store: DataStoreService, private route: ActivatedRoute, private toast: ToastService) {
    this.arbitroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
        especialidad: ['Principal', Validators.required],
      categoria: ['', Validators.required],
      nivelPreparacion: [75, [Validators.required, Validators.min(0), Validators.max(100)]],
    experiencia: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
    fechaNacimiento: [''],
    fechaInicio: [''],
    idiomas: [[]], // store as array (multiple select)
    gradoInstruccion: [''],
    profesion: [''],
      disponible: [true],
      telefono: [''],
      email: ['', [Validators.email]]
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(m => {
      const id = m.get('id');
      if (id) {
        this.isEdit = true;
        this.currentId = id;
        const arbitros = this.store.getArbitros();
        const a = arbitros.find(x => String(x.id) === id);
        if (a) {
          this.arbitroForm.patchValue({
            nombre: a.nombre,
            apellido: a.apellido,
            especialidad: (a as any).especialidad || 'Principal',
            categoria: a.categoria,
            nivelPreparacion: a.nivelPreparacion || 75,
            experiencia: a.experiencia || 1,
            fechaNacimiento: (a as any).fechaNacimiento || '',
            fechaInicio: (a as any).fechaInicio || '',
            idiomas: Array.isArray((a as any).idiomas) ? (a as any).idiomas : (a as any).idiomas ? String((a as any).idiomas).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            gradoInstruccion: (a as any).gradoInstruccion || (a as any).grado || '',
            profesion: (a as any).profesion || (a as any).ocupacion || '',
            disponible: typeof a.disponible === 'boolean' ? a.disponible : true,
            telefono: a.telefono,
            email: a.email
          });
          // set avatarPreview from stored avatar or generate initials
          this.avatarPreview = (a as any).avatar || this.generateInitialsAvatar(a.nombre, a.apellido);
        }
      }
    });

    // regenerate initials avatar when name fields change (only when user hasn't uploaded)
    this.arbitroForm.get('nombre')?.valueChanges.subscribe(() => { this.maybeUpdateInitials(); this.updateComputedInitials(); });
    this.arbitroForm.get('apellido')?.valueChanges.subscribe(() => { this.maybeUpdateInitials(); this.updateComputedInitials(); });
    this.updateComputedInitials();

    // compute experiencia automatically from fechaInicio when it changes
    this.arbitroForm.get('fechaInicio')?.valueChanges.subscribe(val => {
      const years = this.computeExperienceYears(val);
      const ctrl = this.arbitroForm.get('experiencia');
      if (ctrl) {
        // update without emitting another value change event
        ctrl.setValue(years, { emitEvent: false });
      }
    });
  }

  /**
   * Compute experience years from a start date (fechaInicio).
   * Assumption: experience is counted inclusively so a start this same calendar year yields 1 year.
   * Returns at least 1.
   */
  computeExperienceYears(fechaInicio?: string): number {
    if (!fechaInicio) return 1;
    const start = new Date(fechaInicio);
    if (isNaN(start.getTime())) return 1;
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    // adjust if current date is before the anniversary
    const nowMonthDay = now.getMonth() * 100 + now.getDate();
    const startMonthDay = start.getMonth() * 100 + start.getDate();
    if (nowMonthDay < startMonthDay) years--; 
    // inclusive counting: the starting year is considered year 1
    const inclusive = years + 1;
    return Math.max(1, inclusive);
  }

  isIdiomaSelected(idioma: string) {
    const val = this.arbitroForm.get('idiomas')?.value;
    return Array.isArray(val) && val.indexOf(idioma) !== -1;
  }

  toggleIdioma(idioma: string) {
    const ctrl = this.arbitroForm.get('idiomas');
    if (!ctrl) return;
    const arr = Array.isArray(ctrl.value) ? [...ctrl.value] : [];
    const idx = arr.indexOf(idioma);
    if (idx === -1) arr.push(idioma); else arr.splice(idx, 1);
    ctrl.setValue(arr);
  }

  onAvatarSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = reader.result;
    reader.readAsDataURL(file);
  }
  

  private maybeUpdateInitials() {
    // only update if user hasn't selected an uploaded avatar
    if (this.avatarPreview && String(this.avatarPreview).startsWith('data:image')) return;
    const nombre = this.arbitroForm.get('nombre')?.value || '';
    const apellido = this.arbitroForm.get('apellido')?.value || '';
    this.avatarPreview = this.generateInitialsAvatar(nombre, apellido);
  }

  updateComputedInitials() {
    const n = (this.arbitroForm.get('nombre')?.value || '').trim();
    const a = (this.arbitroForm.get('apellido')?.value || '').trim();
    this.computedInitials = ((n[0] || '') + (a[0] || '')).toUpperCase() || 'A';
  }

  public generateInitialsAvatar(nombre: string, apellido: string) {
    const n = (nombre || '').trim();
    const a = (apellido || '').trim();
    const initials = ((n[0] || '') + (a[0] || '')).toUpperCase() || 'A';
    const bg = '#2563eb';
    const fg = '#ffffff';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='${bg}' rx='60' ry='60'/><text x='50%' y='55%' font-size='48' font-family='sans-serif' fill='${fg}' text-anchor='middle' dominant-baseline='middle'>${initials}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  formatPhone() {
    const ctrl = this.arbitroForm.get('telefono');
    if (!ctrl) return;
    const raw = String(ctrl.value || '').replace(/[^0-9]/g, '');
    if (raw.length === 9) {
      ctrl.setValue(`${raw.slice(0,3)}-${raw.slice(3,6)}-${raw.slice(6,9)}`);
    }
  }

  onSubmit() {
    if (this.arbitroForm.invalid) {
      this.arbitroForm.markAllAsTouched();
      this.showValidationToast();
      return;
    }
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const val = this.arbitroForm.value;
    try {
        if (this.isEdit && this.currentId) {
        const updates: any = {
          nombre: val.nombre,
          apellido: val.apellido,
          categoria: val.categoria,
          especialidad: val.especialidad,
          nivelPreparacion: val.nivelPreparacion,
          experiencia: val.experiencia,
          fechaNacimiento: val.fechaNacimiento || undefined,
          fechaInicio: val.fechaInicio || undefined,
          idiomas: Array.isArray(val.idiomas) ? val.idiomas : (val.idiomas ? String(val.idiomas).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          gradoInstruccion: val.gradoInstruccion || undefined,
          profesion: val.profesion || undefined,
          disponible: val.disponible,
          telefono: val.telefono,
            email: val.email,
            avatar: this.avatarPreview
        };
        this.store.updateArbitro(this.currentId, updates);
        this.toast.toast({ title: 'Árbitro actualizado', description: 'Los cambios se guardaron correctamente' });
        } else {
        const newArbitro = {
          id: 'a-' + Math.random().toString(36).slice(2, 9),
          nombre: val.nombre,
          apellido: val.apellido,
          categoria: val.categoria,
          especialidad: val.especialidad,
          nivelPreparacion: val.nivelPreparacion,
          experiencia: val.experiencia,
          fechaNacimiento: val.fechaNacimiento || undefined,
          fechaInicio: val.fechaInicio || undefined,
          idiomas: Array.isArray(val.idiomas) ? val.idiomas : (val.idiomas ? String(val.idiomas).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          gradoInstruccion: val.gradoInstruccion || undefined,
          profesion: val.profesion || undefined,
          disponible: val.disponible,
          telefono: val.telefono,
            email: val.email,
            avatar: this.avatarPreview
        };
        this.store.addArbitro(newArbitro);
        this.toast.toast({ title: 'Árbitro creado', description: 'Árbitro agregado correctamente' });
      }
      this.isSubmitting = false;
      this.router.navigate(['/arbitros']);
    } catch (err) {
      this.isSubmitting = false;
      console.error('Error guardando árbitro', err);
      this.toast.toast({ title: 'Error', description: 'No se pudo guardar el árbitro', variant: 'destructive' });
    }
  }

  private showValidationToast() {
    const controls = this.arbitroForm.controls;
    if (controls['nombre'].invalid) {
      this.toast.toast({ title: 'Validación', description: 'Nombre es obligatorio', variant: 'destructive' });
      return;
    }
    if (controls['apellido'].invalid) {
      this.toast.toast({ title: 'Validación', description: 'Apellido es obligatorio', variant: 'destructive' });
      return;
    }
    if (controls['categoria'].invalid) {
      this.toast.toast({ title: 'Validación', description: 'Categoría es obligatoria', variant: 'destructive' });
      return;
    }
    if (controls['email'].invalid) {
      this.toast.toast({ title: 'Validación', description: 'Email inválido', variant: 'destructive' });
      return;
    }
  }

  onCancel() {
    this.router.navigate(['/arbitros']);
  }
}

