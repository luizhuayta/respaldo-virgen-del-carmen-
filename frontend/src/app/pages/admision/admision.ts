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
  selector: 'app-admision',
  standalone: true,
  imports: [VistaArchivos],
  templateUrl: './admision.html',
  styleUrl: './admision.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Admision implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private API = `${environment.apiUrl}/academic_papers`;
  private BASE = environment.baseUrl;

  docs = signal<PdfDocument[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.http.get<AcademicPaper[]>(`${this.API}/list`)
      .pipe(
        catchError(err => {
          console.error('Error cargando documentos de admisión:', err);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(data => {
        const admision: PdfDocument[] = (data || [])
          .filter(d => d.status && d.type === 'Admisión')
          .map(d => ({
            id: String(d.id),
            label: d.title.toUpperCase(),
            pdfUrl: d.pdf_url ? `${this.BASE}${d.pdf_url}` : ''
          }));
        this.docs.set(admision);
        this.loading.set(false);
      });
  }
}