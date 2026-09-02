import { Component, signal, input, effect } from '@angular/core';
import { PdfDocument } from '../models/pdf-document';
import { LectorPdf } from '../lector-pdf/lector-pdf';

@Component({
  selector: 'app-vista-archivos',
  standalone: true,
  imports: [LectorPdf],
  templateUrl: './vista-archivos.html',
  styleUrl: './vista-archivos.css',
})
export class VistaArchivos {
  readonly documents = input<PdfDocument[]>([]);

  readonly activeId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const docs = this.documents();
      if (docs.length) {
        this.activeId.set(docs[0].id);
      }
    });
  }

  selectDocument(id: string) {
    this.activeId.set(id);
  }

  activeDocument() {
    return this.documents().find((d) => d.id === this.activeId());
  }

  etiqueta(label: string): string {
    const t = label.trim();
    if (!t) return t;
    if (t === t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(t)) {
      return t.charAt(0) + t.slice(1).toLowerCase();
    }
    return t;
  }
}
