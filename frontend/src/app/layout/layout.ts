import { Component } from '@angular/core';
import { ToasterComponent } from '../services/toaster.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToasterComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {

}
