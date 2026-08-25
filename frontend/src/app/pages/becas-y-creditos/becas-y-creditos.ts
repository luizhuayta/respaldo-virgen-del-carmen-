import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { PdfDocument, VistaArchivos } from '../../components/vista-archivos/vista-archivos';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-becas-y-creditos',
  standalone: true,
  imports: [VistaArchivos],
  templateUrl: './becas-y-creditos.html',
  styleUrl: './becas-y-creditos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BecasYCreditos implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private API = `${environment.apiUrl}/academic_papers`;
  private BASE = environment.baseUrl;

  becasDocs = signal<PdfDocument[]>([]);

  ngOnInit(): void {
    this.http.get<any[]>(`${this.API}/list`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          const docs: PdfDocument[] = (data || [])
            .filter(d => d.status && d.type === 'Becas y Créditos')
            .map(d => ({
              id: String(d.id),
              label: d.title.toUpperCase(),
              pdfUrl: d.pdf_url ? `${this.BASE}${d.pdf_url}` : ''
            }));
          this.becasDocs.set(docs);
        },
        error: () => this.becasDocs.set([])
      });
  }
}