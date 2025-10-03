import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../services/asistencia.service';

@Component({
  selector: 'app-estadisticas-asistencia',
  templateUrl: './estadisticas-asistencia.page.html',
  styleUrls: ['./estadisticas-asistencia.page.scss'],
  standalone: true,
  imports: [CommonModule] // CommonModule provee DatePipe y directivas estructurales
})
export class EstadisticasAsistenciaPage implements OnInit {
  hoy = new Date();
  total = 0;
  presentes = 0;
  porcentaje = 0;

  constructor(private svc: AsistenciaService) {}

  ngOnInit(): void {
    const arbitros = this.svc.getArbitros();
    this.total = arbitros.length;
    const hoyKey = this.svc.todayKey(this.hoy);
    const asistencias = this.svc.getAllAsistencias();
    const presentesHoy = asistencias.filter((x:any)=> x.date === hoyKey && x.presente);
    this.presentes = new Set(presentesHoy.map((p:any)=>p.arbitroId)).size;
    this.porcentaje = this.total ? Math.round((this.presentes/this.total)*100) : 0;
  }
}