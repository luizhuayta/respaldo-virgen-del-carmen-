import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticias.html',
  styleUrl: './noticias.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Noticias implements OnInit {

  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private api = environment.apiUrl;

  featuredNoticias = signal<any[]>([]);
  otrasNoticias = signal<any[]>([]);

  // Paginación
  readonly pageSize = 5;
  readonly currentPage = signal(1);

  readonly totalPages = computed(() =>
    Math.ceil(this.otrasNoticias().length / this.pageSize)
  );

  readonly paginatedNoticias = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.otrasNoticias().slice(start, start + this.pageSize);
  });

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  ngOnInit(): void {
    this.http.get<any[]>(`${this.api}/news/list`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          const activas = (data || []).filter(n => n.status).map(n => ({
            ...n,
            contentPlain: this.stripHtml(n.content)
          }));
          this.featuredNoticias.set(activas.slice(0, 2));
          this.otrasNoticias.set(activas.slice(2));
        },
        error: () => {
          this.featuredNoticias.set([]);
          this.otrasNoticias.set([]);
        }
      });
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}