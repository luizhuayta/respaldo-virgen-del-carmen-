import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast';

const TIPOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX = 5 * 1024 * 1024;

@Component({
  selector: 'app-selector-imagen',
  standalone: true,
  templateUrl: './selector-imagen.html',
  styleUrl: './selector-imagen.css',
})
export class SelectorImagen {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  @Input() url = '';
  @Output() urlChange = new EventEmitter<string>();

  subiendo = signal(false);
  nombre = signal('');

  onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.subir(input.files[0]);
    input.value = '';
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.subir(file);
  }

  private subir(file: File) {
    if (!TIPOS.includes(file.type)) {
      this.toast.error('Solo se permiten imágenes JPEG, PNG, GIF o WebP.');
      return;
    }
    if (file.size > MAX) {
      this.toast.error('La imagen no puede superar 5 MB.');
      return;
    }

    this.subiendo.set(true);
    this.nombre.set(file.name);
    const fd = new FormData();
    fd.append('image', file);

    this.http.post<{ imageUrl: string }>(`${environment.apiUrl}/images/upload`, fd).subscribe({
      next: (res) => {
        this.subiendo.set(false);
        this.urlChange.emit(res.imageUrl);
      },
      error: () => {
        this.subiendo.set(false);
        this.toast.error('No se pudo subir la imagen. Inténtelo de nuevo.');
      }
    });
  }
}
