import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { VistaArchivos } from '../../components/vista-archivos/vista-archivos';
import { PdfDocument } from '../../components/models/pdf-document';
import { environment } from '../../../environments/environment';

interface AcademicPaper {
  id: number;
  title: string;
  pdf_url: string;
  status: boolean;
  type: string;
}

@Component({
  selector: 'app-reglamentos',
  standalone: true,
  imports: [VistaArchivos],
  templateUrl: './reglamentos.html',
  styleUrl: './reglamentos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reglamentos implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private API = `${environment.apiUrl}/academic_papers`;
  private BASE = environment.baseUrl;

  reglamentosDocs = signal<PdfDocument[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.http.get<AcademicPaper[]>(`${this.API}/list`)
      .pipe(
        catchError(err => {
          console.error('Error cargando reglamentos:', err);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(data => {
        const reglamentos: PdfDocument[] = (data || [])
          .filter(d => d.status && d.type === 'Reglamentos')
          .map(d => ({
            id: String(d.id),
            label: d.title.toUpperCase(),
            pdfUrl: d.pdf_url ? `${this.BASE}${d.pdf_url}` : ''
          }));
        this.reglamentosDocs.set(reglamentos);
        this.loading.set(false);
      });
  }
}