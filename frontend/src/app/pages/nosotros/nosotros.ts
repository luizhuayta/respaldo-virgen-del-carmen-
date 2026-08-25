import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, DestroyRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Personal {
  id: number;
  nombre: string;
  cargo: string;
  area: string;
  foto: string;
  email: string;
  descripcion: string;
  pdf_url: string;
}

export type ContentType = 'mision' | 'vision' | 'valores' | 'organigrama' | null;

export interface AcademicPersonalDB {
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

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nosotros implements OnInit {
  imageViewer = signal(false);
  expandedHistory = signal(false);
  activeContent = signal<ContentType>('mision');

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  career = signal<any>(null);

  selectedYear = signal<number>(0);
  years = signal<number[]>([]);
  selectedArea = signal<string | null>(null);

  activeProfile = signal<Personal | null>(null);
  safePdfUrl = signal<SafeResourceUrl | null>(null);

  private allPersonal = signal<AcademicPersonalDB[]>([]);

  availableAreas = computed(() => {
    const year = this.selectedYear();
    const filtered = this.allPersonal().filter(p => p.status && p.year === year);
    const areas = filtered.map(p => p.area).filter(a => a && a.trim() !== '');
    return [...new Set(areas)];
  });

  currentPersonal = computed<Personal[]>(() => {
    const year = this.selectedYear();
    const area = this.selectedArea();
    return this.allPersonal()
      .filter(p => {
        if (!p.status || p.year !== year) return false;
        if (area !== null && p.area !== area) return false;
        return true;
      })
      .map(p => ({
        id: p.id,
        nombre: this.abbreviateName(p.grade, p.names, p.last_names),
        cargo: p.position,
        area: p.area ?? '',
        foto: p.img_url ?? '',
        email: p.institucional_email ?? '',
        descripcion: p.description ?? '',
        pdf_url: p.pdf_url ?? '',
      }));
  });

  private abbreviateName(grade: string, names: string, lastNames: string): string {
    const g = grade ? `${grade} ` : '';
    const parts = (names ?? '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${g}${parts[0]} ${parts[1][0]}. ${lastNames}`.trim();
    }
    return `${g}${names} ${lastNames}`.trim();
  }

  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.selectedArea.set(null);
  }

  selectArea(area: string | null): void {
    this.selectedArea.set(area);
  }

  openProfile(persona: Personal) {
    this.activeProfile.set(persona);
    if (persona.pdf_url) {
      const base = environment.baseUrl;
      this.safePdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(base + persona.pdf_url));
    } else {
      this.safePdfUrl.set(null);
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeProfile() {
    this.activeProfile.set(null);
    this.safePdfUrl.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.activeProfile()) {
      this.closeProfile();
    }
    if (this.imageViewer()) {
      this.closeImageViewer();
    }
  }

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/career/list`).pipe(
      catchError(err => {
        console.warn('Error cargando información institucional:', err);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: data => {
        const activo = data.find(c => c.status);
        if (activo) this.career.set({ ...activo });
      }
    });

    this.http.get<AcademicPersonalDB[]>(`${environment.apiUrl}/academic_personal/list`).pipe(
      catchError(err => {
        console.warn('Error cargando plana docente:', err);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: data => {
        this.allPersonal.set(data);
        const uniqueYears = [...new Set(data.map(p => p.year))].sort((a, b) => b - a);
        this.years.set(uniqueYears);
        if (uniqueYears.length > 0) {
          this.selectedYear.set(uniqueYears[0]);
        }
      },
    });

    this.route.fragment.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(fragment => {
      if (fragment && typeof document !== 'undefined') {
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    });
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

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'images/avatar-placeholder.png';
    }
  }
}