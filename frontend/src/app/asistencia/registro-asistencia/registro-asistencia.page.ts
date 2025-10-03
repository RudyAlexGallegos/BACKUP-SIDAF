import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../services/asistencia.service';

@Component({
  selector: 'app-registro-asistencia',
  templateUrl: './registro-asistencia.page.html',
  styleUrls: ['./registro-asistencia.page.scss'],
  standalone: true,
  imports: [CommonModule] // agrega CommonModule para *ngFor / pipes
})
export class RegistroAsistenciaPage implements OnInit {
  arbitros: any[] = [];

  // marca el servicio como public si la plantilla lo usa
  constructor(public svc: AsistenciaService) {}

  ngOnInit(): void {
    this.arbitros = this.svc.getArbitros();
  }

  // expón métodos usados por la plantilla si hacen falta (toggle/mark/unmark)
  toggle(id: string) {
    const key = this.svc.todayKey ? this.svc.todayKey() : new Date().toISOString().slice(0,10);
    if (this.svc.hasAttendance(id, key)) this.svc.unmark(id, key);
    else this.svc.mark(id, key, true);
    this.arbitros = this.svc.getArbitros();
  }
}