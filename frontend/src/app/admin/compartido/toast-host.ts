import { Component, inject } from '@angular/core';
import { ToastService } from './toast';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
})
export class ToastHost {
  toast = inject(ToastService);
}
