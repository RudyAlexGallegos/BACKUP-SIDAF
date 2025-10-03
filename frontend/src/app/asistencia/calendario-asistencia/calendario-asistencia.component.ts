import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendario-asistencia',
  templateUrl: './calendario-asistencia.component.html',
  styleUrls: ['./calendario-asistencia.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CalendarioAsistenciaComponent {
  @Output() selectRange = new EventEmitter<{ from?: string, to?: string }>();
  from?: string;
  to?: string;
  apply() { this.selectRange.emit({ from: this.from, to: this.to }); }
}