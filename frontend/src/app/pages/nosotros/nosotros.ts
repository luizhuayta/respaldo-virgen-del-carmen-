import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';

interface Personal {
  id: number;
  nombre: string;
  cargo: string;
  area: string;
  foto: string;
  email: string;
  descripcion: string;
  pdf_url: string;
  iniciales: string;
  tipo: string;
}

type ContentType = 'mision' | 'vision' | 'valores' | 'organigrama' | null;

interface AcademicPersonalDB {
  id: number;
  type: string;
  names: string;
  last_names: string;
  grade: string;
  position: string;
  area: string;
  img_url: string;
  year: number;
  description: string;
  institucional_email: string;
  pdf_url: string;
  status: boolean;
}

const TIPO_ORDEN: Record<string, number> = {
  Autoridad: 0,
  Docente: 1,
  Administrativo: 2,
  Complementario: 3,
};

@Component({
  selector: 'app-nosotros',
  imports: [CommonModule, A11yModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
})
export class Nosotros implements OnInit {
  imageViewer = signal(false);
  expandedHistory = signal(false);
  activeContent = signal<ContentType>(null);

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  career = signal<any>(null);

  selectedYear = signal(0);
  years = signal<number[]>([]);
  selectedArea = signal<string | null>(null);
  loadingPersonal = signal(true);
  fotoRota = signal<Record<number, boolean>>({});

  activeProfile = signal<Personal | null>(null);
  safePdfUrl = signal<SafeResourceUrl | null>(null);

  private allPersonal = signal<AcademicPersonalDB[]>([]);

  availableAreas = computed(() => {
    const filtered = this.allPersonal().filter(p => p.status && p.year === this.selectedYear());
    const areas = filtered.map(p => p.area).filter(a => a && a.trim() !== '');
    return [...new Set(areas)];
  });

  currentPersonal = computed(() => {
    return this.allPersonal()
      .filter(p => {
        if (!p.status || p.year !== this.selectedYear()) return false;
        if (this.selectedArea() !== null && p.area !== this.selectedArea()) return false;
        return true;
      })
      .sort((a, b) => (TIPO_ORDEN[a.type] ?? 9) - (TIPO_ORDEN[b.type] ?? 9))
      .map(p => this.toPersonal(p));
  });

  private toPersonal(p: AcademicPersonalDB): Personal {
    const names = (p.names ?? '').trim();
    const lastNames = (p.last_names ?? '').trim();
    const grade = (p.grade ?? '').trim();

    return {
      id: p.id,
      nombre: [grade, names, lastNames].filter(Boolean).join(' '),
      cargo: p.position ?? '',
      area: p.area ?? '',
      foto: this.resolveFoto(p.img_url),
      email: p.institucional_email ?? '',
      descripcion: p.description ?? '',
      pdf_url: p.pdf_url ?? '',
      iniciales: this.iniciales(names, lastNames),
      tipo: p.type ?? '',
    };
  }

  private resolveFoto(url?: string): string {
    const u = (url ?? '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('blob:')) return u;
    return `${environment.baseUrl}${u.startsWith('/') ? u : '/' + u}`;
  }

  private iniciales(names: string, lastNames: string): string {
    const n = names.split(/\s+/).find(Boolean)?.[0] ?? '';
    const l = lastNames.split(/\s+/).find(Boolean)?.[0] ?? '';
    return (n + l).toUpperCase() || '—';
  }

  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.selectedArea.set(null);
  }

  selectArea(area: string | null): void {
    this.selectedArea.set(area);
  }

  onFotoError(id: number) {
    this.fotoRota.update(map => ({ ...map, [id]: true }));
  }

  openProfile(persona: Personal) {
    this.activeProfile.set(persona);
    if (persona.pdf_url) {
      const base = environment.baseUrl
      this.safePdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(base + persona.pdf_url));
    } else {
      this.safePdfUrl.set(null);
    }
    document.body.style.overflow = 'hidden';
  }

  closeProfile() {
    this.activeProfile.set(null);
    this.safePdfUrl.set(null);
    document.body.style.overflow = '';
  }

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/career/list`).subscribe({
      next: data => {
        const activo = data.find(c => c.status);
        if (activo) this.career.set({ ...activo });
      }
    });

    this.http.get<AcademicPersonalDB[]>(`${environment.apiUrl}/academic_personal/list`).subscribe({
      next: data => {
        this.allPersonal.set(data);
        const uniqueYears = [...new Set(data.map(p => p.year))].sort((a, b) => b - a);
        this.years.set(uniqueYears);
        if (uniqueYears.length > 0) this.selectedYear.set(uniqueYears[0]);
        this.loadingPersonal.set(false);
      },
      error: () => this.loadingPersonal.set(false),
    });

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    });
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  showContent(type: ContentType) {
    this.activeContent.update(current => current === type ? null : type);
  }

  toggleHistory(): void {
    this.expandedHistory.update(v => !v);
  }

  sanitizeHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/ style="[^"]*"/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  openImageViewer(event: Event) {
    event.stopPropagation();
    this.imageViewer.set(true);
  }

  closeImageViewer() {
    this.imageViewer.set(false);
  }
}