import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LectorPdf } from '../../components/lector-pdf/lector-pdf';

interface Investigacion {
  id: number;
  title: string;
  author: string;
  content: string;
  publication_date: string;
  description: string;
  pdf_url: string | null;
  rawPdfUrl: string | null;
  status: boolean;
}

@Component({
  selector: 'app-repositorio',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule, LectorPdf],
  templateUrl: './repositorio.html',
  styleUrl: './repositorio.css',
})
export class Repositorio implements OnInit {
  private http = inject(HttpClient);
  private BASE = environment.baseUrl;

  investigaciones = signal<Investigacion[]>([]);
  loading = signal(true);

  pdfViewer = signal<string | null>(null);
  pdfTitle = signal('');

  // ===== FILTROS =====
  selectedYear  = signal<string>('');
  selectedMonth = signal<string>('');
  searchQuery   = signal<string>('');

  readonly mesesNombre: Record<string, string> = {
    '01': 'Enero',   '02': 'Febrero', '03': 'Marzo',
    '04': 'Abril',   '05': 'Mayo',    '06': 'Junio',
    '07': 'Julio',   '08': 'Agosto',  '09': 'Septiembre',
    '10': 'Octubre', '11': 'Noviembre','12': 'Diciembre'
  };

  availableYears = computed(() => {
    const years = this.investigaciones()
      .map(i => i.publication_date?.substring(0, 4))
      .filter(Boolean);
    return [...new Set(years)].sort((a, b) => b.localeCompare(a));
  });

  availableMonths = computed(() => {
    const year = this.selectedYear();
    if (!year) return [];
    const months = this.investigaciones()
      .filter(i => i.publication_date?.startsWith(year))
      .map(i => i.publication_date?.substring(5, 7))
      .filter(Boolean);
    return [...new Set(months)].sort();
  });

  onYearChange() {
    this.selectedMonth.set('');
    this.currentPage.set(1);
  }
  // ===================

  sorted = computed(() => {
    const year  = this.selectedYear();
    const month = this.selectedMonth();
    const query = this.searchQuery().toLowerCase().trim();

    return [...this.investigaciones().filter(i => i.status)]
      .filter(i => {
        const matchYear  = !year  || i.publication_date?.startsWith(year);
        const matchMonth = !month || i.publication_date?.substring(5, 7) === month;
        const matchQuery = !query ||
          i.title?.toLowerCase().includes(query) ||
          i.author?.toLowerCase().includes(query);
        return matchYear && matchMonth && matchQuery;
      })
      .sort((a, b) => {
        const da = a.publication_date ? new Date(a.publication_date).getTime() : 0;
        const db = b.publication_date ? new Date(b.publication_date).getTime() : 0;
        return db - da;
      });
  });

  destacados = computed(() => this.sorted().slice(0, 2));
  private allLista = computed(() => this.sorted().slice(2));

  readonly PAGE_SIZE = 10;

  currentPage = signal(1);
  totalPages  = computed(() => Math.max(1, Math.ceil(this.allLista().length / this.PAGE_SIZE)));
  lista       = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.allLista().slice(start, start + this.PAGE_SIZE);
  });
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.http.get<any[]>(`${this.BASE}/api/investigations/list`).subscribe({
      next: (data) => {
        this.investigaciones.set(
          data
            .filter(i => i.status)
            .map(i => ({
              id: i.id,
              title: i.title,
              author: i.author ?? 'Autor no especificado',
              content: i.content,
              publication_date: i.publication_date,
              description: i.description,
              rawPdfUrl: i.pdf_url ? `${this.BASE}${i.pdf_url}` : null,
              pdf_url: i.pdf_url ? `${this.BASE}${i.pdf_url}` : null,
              status: i.status,
            }))
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openPdf(inv: Investigacion, event: Event) {
    event.stopPropagation();
    if (!inv.pdf_url) return;
    this.pdfTitle.set(inv.title);
    this.pdfViewer.set(inv.rawPdfUrl ?? inv.pdf_url);
  }

  closePdf() {
    this.pdfViewer.set(null);
    this.pdfTitle.set('');
  }

  stripHtml(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  excerpt(html: string, max = 160): string {
    const text = this.stripHtml(html);
    return text.length > max ? text.substring(0, max) + '...' : text;
  }
}