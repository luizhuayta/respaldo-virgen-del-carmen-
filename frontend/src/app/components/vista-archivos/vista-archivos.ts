import { ChangeDetectionStrategy, Component, signal, input, inject, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { PdfDocument } from '../models/pdf-document';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export type { PdfDocument };

@Component({
  selector: 'app-vista-archivos',
  standalone: true,
  imports: [NgClass],
  templateUrl: './vista-archivos.html',
  styleUrl: './vista-archivos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VistaArchivos {
  readonly documents = input<PdfDocument[]>([]);
  readonly activeId = signal<string | null>(null);

  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      const docs = this.documents();
      if (docs.length && (!this.activeId() || !docs.some(d => d.id === this.activeId()))) {
        this.activeId.set(docs[0].id);
      }
    });
  }

  selectDocument(id: string) {
    this.activeId.set(id);
  }

  activeDocument(): PdfDocument | undefined {
    return this.documents().find((d) => d.id === this.activeId());
  }

  safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

