import { Component, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-aviso-cambios',
  standalone: true,
  imports: [A11yModule],
  templateUrl: './aviso-cambios.html',
  styleUrl: './aviso-cambios.css',
})
export class AvisoCambios {
  guardar = output<void>();
  descartar = output<void>();
  seguir = output<void>();
}
