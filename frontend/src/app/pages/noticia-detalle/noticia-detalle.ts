import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

interface ArticleConfig {
  apiList: string;
  contentField: string;
  volverLabel: string;
  volverLink: string;
  otrasLabel: string;
  detalleBase: string;
}

@Component({
  selector: 'app-noticia-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticia-detalle.html',
  styleUrl: './noticia-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticiaDetalle implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private readonly baseApi = environment.apiUrl;

  noticia = signal<any>(null);
  loading = signal(true);
  error = signal(false);
  otrasNoticias = signal<any[]>([]);
  showImageViewer = signal(false);
  currentUrl = '';

  config: ArticleConfig = {
    apiList: `${this.baseApi}/news/list`,
    contentField: 'content',
    volverLabel: 'Volver a Noticias',
    volverLink: '/noticias',
    otrasLabel: 'Otras Noticias',
    detalleBase: '/noticias',
  };

  @HostListener('window:keydown.escape')
  onEscapePressed(): void {
    if (this.showImageViewer()) {
      this.toggleViewer(false);
    }
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const tipo = this.route.snapshot.data['tipo'] ?? 'noticias';
    if (tipo === 'comunicado') {
      this.config = {
        apiList: `${this.baseApi}/press_releases/list`,
        contentField: 'press_release',
        volverLabel: 'Volver al Inicio',
        volverLink: '/inicio',
        otrasLabel: 'Otros Comunicados',
        detalleBase: '/comunicado',
      };
    }

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = params.get('id');
        if (typeof window !== 'undefined') {
          this.currentUrl = encodeURIComponent(window.location.href);
        }
        this.cargarArticulo(id);
      });
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  getContent(): string {
    return this.noticia()?.[this.config.contentField] || '';
  }

  private cargarArticulo(id: string | null): void {
    this.loading.set(true);
    this.error.set(false);
    this.noticia.set(null);

    this.http.get<any[]>(`${this.config.apiList}?id=${id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          const activo = (data || []).find((n: any) => n.status);
          if (activo) {
            this.noticia.set(activo);
          } else {
            this.error.set(true);
          }
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });

    this.http.get<any[]>(this.config.apiList)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          const otras = (data || [])
            .filter((n: any) => n.status && String(n.id) !== String(id))
            .slice(0, 3)
            .map((n: any) => ({
              ...n,
              contentPlain: this.stripHtml(n[this.config.contentField] || '')
            }));
          this.otrasNoticias.set(otras);
        },
        error: () => this.otrasNoticias.set([])
      });
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  toggleViewer(state: boolean): void {
    this.showImageViewer.set(state);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = state ? 'hidden' : 'auto';
    }
  }
}
