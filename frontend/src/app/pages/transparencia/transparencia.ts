import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transparencia',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './transparencia.html',
  styleUrls: ['./transparencia.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transparencia {}

