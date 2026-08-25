import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

interface Investigacion {
  id: number;
  title: string;
  author: string;
  content: string;
  publication_date: string;
  description: string;
  pdf_url: SafeResourceUrl | null;
  rawPdfUrl: string | null;
  status: boolean;
}

@Component({
  selector: 'app-repositorio',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './repositorio.html',
  styleUrl: './repositorio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repositorio implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  private BASE = environment.baseUrl;

  investigaciones = signal<Investigacion[]>([]);
  loading = signal(true);

  pdfViewer = signal<SafeResourceUrl | null>(null);
  pdfTitle = signal('');

  // ===== FILTROS =====
  selectedYear  = signal<string>('');
  selectedMonth = signal<string>('');
  searchQuery   = signal<string>('');

  readonly pageSize = 6;
  readonly currentPage = signal(1);

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

  sorted = computed(() => {
    const year  = this.selectedYear();
    const month = this.selectedMonth();
    const q     = this.searchQuery().trim().toLowerCase();

    return this.investigaciones().filter(i => {
      if (year && !i.publication_date?.startsWith(year)) return false;
      if (month && i.publication_date?.substring(5, 7) !== month) return false;
      if (q) {
        const titleMatch   = i.title?.toLowerCase().includes(q);
        const authorMatch  = i.author?.toLowerCase().includes(q);
        const descMatch    = i.description?.toLowerCase().includes(q);
        if (!titleMatch && !authorMatch && !descMatch) return false;
      }
      return true;
    });
  });

  destacados = computed(() => this.sorted().slice(0, 2));

  allRemaining = computed(() => this.sorted().slice(2));

  totalPages = computed(() =>
    Math.ceil(this.allRemaining().length / this.pageSize) || 1
  );

  lista = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allRemaining().slice(start, start + this.pageSize);
  });

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onYearChange(year?: string) {
    if (year !== undefined) {
      this.selectedYear.set(year);
    }
    this.selectedMonth.set('');
    this.currentPage.set(1);
  }

  onMonthChange(month: string) {
    this.selectedMonth.set(month);
    this.currentPage.set(1);
  }

  clearFilters() {
    this.selectedYear.set('');
    this.selectedMonth.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  hasActiveFilters = computed(() =>
    !!(this.selectedYear() || this.selectedMonth() || this.searchQuery().trim())
  );

  @HostListener('window:keydown.escape')
  onEscapePressed(): void {
    if (this.pdfViewer()) {
      this.closePdf();
    }
  }

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/academic_papers/list`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.investigaciones.set(
            (data || [])
              .filter(i => i.status)
              .map(i => ({
                id: i.id,
                title: i.title,
                author: i.author ?? 'Autor no especificado',
                content: i.content,
                publication_date: i.publication_date,
                description: i.description,
                rawPdfUrl: i.pdf_url ? `${this.BASE}${i.pdf_url}` : null,
                pdf_url: i.pdf_url
                  ? this.sanitizer.bypassSecurityTrustResourceUrl(`${this.BASE}${i.pdf_url}`)
                  : null,
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
    this.pdfViewer.set(inv.pdf_url);
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