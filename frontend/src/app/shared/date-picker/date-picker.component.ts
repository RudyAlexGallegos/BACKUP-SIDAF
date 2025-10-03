import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  template: `<input type="date" (change)="onChange($event)" class="w-full" />`
})
export class DatePickerStubComponent {
  @Input() value?: Date;
  @Output() selectedChange = new EventEmitter<Date>();

  onChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const d = input.value ? new Date(input.value) : new Date();
    this.selectedChange.emit(d);
  }
}