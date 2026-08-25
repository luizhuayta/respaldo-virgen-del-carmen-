import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
  Renderer2,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio implements OnInit, AfterViewInit, OnDestroy {

  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private api = environment.apiUrl;

  latestNoticias = signal<any[]>([]);
  latestComunicados = signal<any[]>([]);
  contact = signal<any | null>(null);
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('track') track!: ElementRef;

  heroImages: { src: string; alt: string }[] = [
    {
      src: 'images/hero-1-opt.jpg',
      alt: 'Frontis del Instituto de Educación Superior Pedagógico Público Virgen del Carmen',
    },
    {
      src: 'images/hero-2-opt.jpg',
      alt: 'Estudiantes del I.E.S.P.P. Virgen del Carmen en actividades formativas',
    },
    {
      src: 'images/hero-3-opt.jpg',
      alt: 'Comunidad docente y estudiantil en ceremonia institucional',
    },
  ];

  currentHeroIndex = 0;
  licenciaActiva = false;
  private heroInterval: ReturnType<typeof setInterval> | null = null;
  private reducedMotionMediaQuery: MediaQueryList | null = null;
  private prefersReducedMotion = false;
  private isCarouselVisible = true;
  private carouselObserver: IntersectionObserver | null = null;

  items: { image: string; url: string; alt: string }[] = [
    {
      image: 'https://americancomputeriquitos.com/images/difoid.png',
      url: 'https://www.minedu.gob.pe/superiorpedagogica/',
      alt: 'DIFOID — Dirección de Formación Inicial Docente (MINEDU)',
    },
    {
      image:
        'https://upload.wikimedia.org/wikipedia/commons/2/21/Logo_del_Ministerio_de_Educaci%C3%B3n_del_Per%C3%BA_-_MINEDU.png',
      url: 'https://www.gob.pe/minedu',
      alt: 'Ministerio de Educación del Perú (MINEDU)',
    },
    {
      image: 'https://web.gereducusco.gob.pe/wp-content/uploads/geredu_cusco_dark.png',
      url: 'https://www.gob.pe/regioncusco-geredu',
      alt: 'Gerencia Regional de Educación del Cusco (GEREDU)',
    },
    {
      image:
        'images/logo-siges.png',
      url: 'https://www.gob.pe/institucion/minedu/noticias/506778-minedu-crea-el-sistema-integrado-de-informacion-de-la-educacion-superior-y-tecnico-productiva',
      alt: 'SIGES — Sistema Integrado de Información de la Educación Superior',
    },
    {
      image: 'images/logo-perueduca.png',
      url: 'https://www.perueduca.pe/#/home',
      alt: 'PerúEduca — Plataforma Educativa del MINEDU',
    },
    {
      image:
        'images/logo-titulos.png',
      url: 'https://www.gob.pe/941-consultar-titulos-de-instituciones-tecnologicas-y-pedagogicas',
      alt: 'Consulta Pública de Títulos Pedagógicos y Tecnológicos (MINEDU)',
    },
  ];

  // Auto-scroll
  private animationId: number | null = null;
  private isPaused = false;
  private scrollSpeed = 0.5;
  private currentTranslate = 0;

  // Drag
  private isDragging = false;
  private startX = 0;
  private dragStartTranslate = 0;
  private didDrag = false;

  private listeners: (() => void)[] = [];

  constructor(
    private renderer: Renderer2,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.http.get<any[]>(`${this.api}/news/list`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.latestNoticias.set(Array.isArray(data) ? data.filter(n => n && n.status).slice(0, 3) : []);
          this.cdr.markForCheck();
        },
        error: () => {
          this.latestNoticias.set([]);
          this.cdr.markForCheck();
        }
      });

    this.http.get<any[]>(`${this.api}/press_releases/list`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.latestComunicados.set(Array.isArray(data) ? data.filter(n => n && n.status).slice(0, 3) : []);
          this.cdr.markForCheck();
        },
        error: () => {
          this.latestComunicados.set([]);
          this.cdr.markForCheck();
        }
      });

    this.http.get<any[]>(`${this.api}/contacts/list`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (Array.isArray(data) && data.length > 0) {
            this.contact.set(data[0]);
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.contact.set(null);
          this.cdr.markForCheck();
        }
      });
  }

  ngAfterViewInit() {
    this.cloneItems();

    if (typeof window !== 'undefined') {
      this.reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = this.reducedMotionMediaQuery.matches;

      const motionListener = (e: MediaQueryListEvent) => {
        this.prefersReducedMotion = e.matches;
        if (this.prefersReducedMotion) {
          if (this.heroInterval) {
            clearInterval(this.heroInterval);
            this.heroInterval = null;
          }
        } else {
          this.startHeroSlideshow();
        }
      };

      if (this.reducedMotionMediaQuery.addEventListener) {
        this.reducedMotionMediaQuery.addEventListener('change', motionListener);
        this.listeners.push(() => this.reducedMotionMediaQuery?.removeEventListener('change', motionListener));
      }

      // IntersectionObserver para pausar auto-scroll del carrusel cuando no está en pantalla
      if ('IntersectionObserver' in window && this.carousel) {
        this.carouselObserver = new IntersectionObserver((entries) => {
          const entry = entries[0];
          this.isCarouselVisible = entry.isIntersecting;
        }, { threshold: 0.05 });
        this.carouselObserver.observe(this.carousel.nativeElement);
      }
    }

    if (!this.prefersReducedMotion) {
      this.startHeroSlideshow();
    }

    this.ngZone.runOutsideAngular(() => {
      this.startAutoScroll();
      this.bindEvents();
    });
  }

  ngOnDestroy() {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.listeners.forEach((fn) => fn());
    if (this.carouselObserver) {
      this.carouselObserver.disconnect();
    }
    if (this.heroInterval) clearInterval(this.heroInterval);
  }

  private startHeroSlideshow() {
    if (this.heroInterval) clearInterval(this.heroInterval);
    if (this.prefersReducedMotion) return;

    this.heroInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
        this.cdr.detectChanges();
      });
    }, 4500);
  }

  onImageError(event: Event, fallbackType: 'news' | 'comunicado' | 'logo' = 'news') {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'images/banner-hero-nosotros.png';
    }
  }

  goToHeroSlide(index: number) {
    this.currentHeroIndex = index;
  }

  toggleLicencia(event: Event) {
    // Solo activar toggle en móvil
    if (window.innerWidth < 768) {
      event.preventDefault();
      this.licenciaActiva = !this.licenciaActiva;
    }
  }

  get whatsappUrl(): string {

    const phone = this.contact()?.phone;

    if (!phone) {
      return '#';
    }

    const cleanPhone = phone.replace(/\D/g, '');

    const fullPhone = cleanPhone.startsWith('51')
      ? cleanPhone
      : `51${cleanPhone}`;

    return `https://wa.me/${fullPhone}`;
  }

  // ── Loop infinito: clona los items al final del track (aislando accesibilidad) ──
  private cloneItems() {
    const track = this.track.nativeElement as HTMLElement;
    const origItems = Array.from(track.children) as HTMLElement[];
    origItems.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      if (clone.tagName === 'A') {
        clone.setAttribute('tabindex', '-1');
      }
      clone.querySelectorAll('a, button, input').forEach((el) => {
        el.setAttribute('tabindex', '-1');
        el.setAttribute('aria-hidden', 'true');
      });
      track.appendChild(clone);
    });
  }

  // ── Auto scroll ──
  private startAutoScroll() {
    const track = this.track.nativeElement as HTMLElement;

    const tick = () => {
      if (
        !this.isPaused &&
        !this.isDragging &&
        !this.prefersReducedMotion &&
        this.isCarouselVisible &&
        (typeof document === 'undefined' || document.visibilityState === 'visible')
      ) {
        this.currentTranslate -= this.scrollSpeed;

        // Ancho de los items originales (la mitad del track clonado)
        const halfWidth = track.scrollWidth / 2;

        // Cuando llegamos al final de los originales, volvemos al inicio
        if (Math.abs(this.currentTranslate) >= halfWidth) {
          this.currentTranslate = 0;
        }

        track.style.transform = `translateX(${this.currentTranslate}px)`;
      }
      this.animationId = requestAnimationFrame(tick);
    };

    this.animationId = requestAnimationFrame(tick);
  }

  // ── Bind eventos ──
  private bindEvents() {
    const carousel = this.carousel.nativeElement as HTMLElement;
    const track = this.track.nativeElement as HTMLElement;

    // Pausa al hacer hover sobre el carousel
    this.listeners.push(
      this.renderer.listen(carousel, 'mouseenter', () => {
        this.isPaused = true;
      }),
    );
    this.listeners.push(
      this.renderer.listen(carousel, 'mouseleave', () => {
        this.isPaused = false;
        if (!this.isDragging) {
          this.didDrag = false;
        }
      }),
    );

    // Drag — mouse
    this.listeners.push(
      this.renderer.listen(track, 'mousedown', (e: MouseEvent) => this.onDragStart(e)),
    );
    this.listeners.push(
      this.renderer.listen(window, 'mousemove', (e: MouseEvent) => this.onDragMove(e)),
    );
    this.listeners.push(this.renderer.listen(window, 'mouseup', () => this.onDragEnd()));

    // Drag — touch
    this.listeners.push(
      this.renderer.listen(track, 'touchstart', (e: TouchEvent) => this.onDragStart(e)),
    );
    this.listeners.push(
      this.renderer.listen(window, 'touchmove', (e: TouchEvent) => this.onDragMove(e)),
    );
    this.listeners.push(this.renderer.listen(window, 'touchend', () => this.onDragEnd()));

    // Evitar navegación al hacer click después de drag
    this.listeners.push(
      this.renderer.listen(track, 'click', (e: MouseEvent) => {
        if (this.didDrag) {
          e.preventDefault();
          this.didDrag = false;
        }
      }),
    );
  }

  private onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.didDrag = false;
    this.startX = this.getClientX(event);
    this.dragStartTranslate = this.currentTranslate;
    this.track.nativeElement.style.transition = 'none';
    this.track.nativeElement.style.cursor = 'grabbing';
  }

  private onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const diff = this.getClientX(event) - this.startX;
    if (Math.abs(diff) > 3) this.didDrag = true;

    this.currentTranslate = this.dragStartTranslate + diff;
    this.track.nativeElement.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  private onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.nativeElement.style.cursor = 'grab';
  }

  private getClientX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }
}
