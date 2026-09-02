import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { LectorPdf } from '../../components/lector-pdf/lector-pdf';

@Component({
  selector: 'app-repositorio-detalle',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, LectorPdf],
  templateUrl: './repositorio-detalle.html',
  styleUrl: './repositorio-detalle.css',
})
export class RepositorioDetalle implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private BASE = environment.baseUrl;

  investigacion = signal<any>(null);
  loading = signal(true);
  notFound = signal(false);

  pdfUrl = computed(() => {
    const inv = this.investigacion();
    if (!inv?.pdf_url) return null;
    return `${this.BASE}${inv.pdf_url}`;
  });

  safeContent = computed(() => {
    const inv = this.investigacion();
    if (!inv?.content) return null;
    return this.sanitizer.bypassSecurityTrustHtml(inv.content);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound.set(true); this.loading.set(false); return; }

    this.http.get<any[]>(`${this.BASE}/api/investigations/list?id=${id}`).subscribe({
      next: (data) => {
        const item = Array.isArray(data) ? data[0] : data;
        if (!item) { this.notFound.set(true); }
        else { this.investigacion.set(item); }
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }
}
