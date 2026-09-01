import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

type NoticiaItem = {
  id: number;
  title: string;
  content?: string;
  contentPlain: string;
  img_url: string;
  description?: string;
  createdAt: string;
  status: boolean;
};

@Component({
  selector: 'app-noticias',
  imports: [CommonModule, RouterLink],
  templateUrl: './noticias.html',
  styleUrl: './noticias.css',
})
export class Noticias implements OnInit {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  readonly fallbackImg = '/images/Logo.png';
  readonly pageSize = 5;

  todas = signal<NoticiaItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  query = signal('');
  currentPage = signal(1);

  destacada = computed(() => {
    if (this.query().trim()) return null;
    return this.todas()[0] ?? null;
  });

  filtradas = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.todas();
    const source = q ? list : list.slice(1);
    if (!q) return source;
    return list.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.contentPlain.toLowerCase().includes(q) ||
      (n.description || '').toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.ceil(this.filtradas().length / this.pageSize)
  );

  paginatedNoticias = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtradas().slice(start, start + this.pageSize);
  });

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<any[]>(`${this.api}/news/list`).subscribe({
      next: data => {
        const activas = (Array.isArray(data) ? data : [])
          .filter(n => n.status)
          .map(n => ({
            ...n,
            contentPlain: this.stripHtml(n.content || '') || this.stripHtml(n.description || ''),
          }));
        this.todas.set(activas);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las noticias. Inténtalo de nuevo.');
        this.todas.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.query.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    document.querySelector('.noticias-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  formatFecha(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.includes(this.fallbackImg)) return;
    img.src = this.fallbackImg;
    img.classList.add('is-fallback');
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  }
}
