import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-repositorio-detalle',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './repositorio-detalle.html',
  styleUrl: './repositorio-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepositorioDetalle implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  private BASE = environment.baseUrl;

  investigacion = signal<any>(null);
  loading = signal(true);
  notFound = signal(false);

  safePdfUrl = computed(() => {
    const inv = this.investigacion();
    if (!inv?.pdf_url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${this.BASE}${inv.pdf_url}`);
  });

  safeContent = computed(() => {
    const inv = this.investigacion();
    if (!inv?.content) return null;
    return this.sanitizer.bypassSecurityTrustHtml(inv.content);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.http.get<any[]>(`${this.BASE}/api/investigations/list?id=${id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const item = Array.isArray(data) ? data[0] : data;
          if (!item) {
            this.notFound.set(true);
          } else {
            this.investigacion.set(item);
          }
          this.loading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.loading.set(false);
        }
      });
  }
}
