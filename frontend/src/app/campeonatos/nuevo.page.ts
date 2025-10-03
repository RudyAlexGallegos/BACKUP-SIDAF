import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataStoreService, Campeonato } from '../services/data-store.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-campeonato-nuevo',
  template: `
  <div class="p-6 max-w-lg mx-auto">
    <h2 class="text-xl font-bold mb-4">{{ isEdit ? 'Editar' : 'Nuevo' }} Campeonato</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label class="block mb-2">Nombre</label>
      <input formControlName="nombre" class="input input-bordered w-full mb-3" />

      <label class="block mb-2">Nivel de dificultad</label>
      <input formControlName="nivelDificultad" class="input input-bordered w-full mb-3" />

      <label class="block mb-2">Número de equipos</label>
      <input type="number" formControlName="equipos" class="input input-bordered w-full mb-3" />

      <div class="flex gap-2 mt-4">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
        <button type="button" class="btn btn-ghost" (click)="cancel()">Cancelar</button>
      </div>
    </form>
  </div>
  `
})
export class NuevoCampeonatoPage implements OnInit {
  form: FormGroup;
  isEdit = false;
  currentId?: string;
  constructor(private fb: FormBuilder, private store: DataStoreService, private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      nivelDificultad: [''],
      equipos: [8, [Validators.required, Validators.min(1)]],
    });
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(m => {
      const id = m.get('id');
      if (id) {
        this.isEdit = true; this.currentId = id;
        const c = this.store.getCampeonatos().find(x => x.id === id);
        if (c) this.form.patchValue(c as any);
      }
    });
  }
  submit() {
    if (this.form.invalid) return;
    const payload: Campeonato = { id: this.currentId ?? undefined as any, ...this.form.value } as Campeonato;
    if (this.isEdit && this.currentId) {
      this.store.updateCampeonato(this.currentId, payload);
    } else {
      this.store.addCampeonato(payload);
    }
    this.router.navigate(['/campeonatos']);
  }
  cancel() { this.router.navigate(['/campeonatos']); }
}
