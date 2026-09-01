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
  inject,
  signal
} from '@angular/core';
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
})
export class Inicio implements OnInit, AfterViewInit, OnDestroy {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Signals independientes para estados de carga y error
  loadingNoticias = signal(false);
  errorNoticias = signal<string | null>(null);
  loadingComunicados = signal(false);
  errorComunicados = signal<string | null>(null);
  loadingContact = signal(false);
  errorContact = signal<string | null>(null);

  latestNoticias = signal<any[]>([]);
  latestComunicados = signal<any[]>([]);
  contact = signal<any | null>(null);
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('track') track!: ElementRef;

  heroImages: { src: string; alt: string }[] = [
    {
      src: 'images/hero-1.jpg',
      alt: 'Hero 1',
    },
    { src: 'images/hero-2.png', alt: 'Hero 2' },
    {
      src: 'images/hero-3.jpg',
      alt: 'Hero 3',
    },
  ];

  currentHeroIndex = 0;
  private heroInterval: ReturnType<typeof setInterval> | null = null;

  items: { image: string; url: string; alt: string }[] = [
    {
      image: 'https://americancomputeriquitos.com/images/difoid.png',
      url: 'https://www.minedu.gob.pe/superiorpedagogica/',
      alt: 'MINEDU Superior Pedagógica',
    },
    {
      image:
        'https://upload.wikimedia.org/wikipedia/commons/2/21/Logo_del_Ministerio_de_Educaci%C3%B3n_del_Per%C3%BA_-_MINEDU.png',
      url: 'https://www.gob.pe/minedu',
      alt: 'Ministerio de Educación',
    },
    {
      image: 'https://web.gereducusco.gob.pe/wp-content/uploads/geredu_cusco_dark.png',
      url: 'https://www.gob.pe/regioncusco-geredu',
      alt: 'GEREDU Cusco',
    },
    {
      image:
        'images/logo-siges.png',
      url: 'https://www.gob.pe/institucion/minedu/noticias/506778-minedu-crea-el-sistema-integrado-de-informacion-de-la-educacion-superior-y-tecnico-productiva',
      alt: 'SIGES',
    },
    {
      image: 'images/logo-perueduca.png',
      url: 'https://www.perueduca.pe/#/home',
      alt: 'Perú Educa',
    },
    {
      image:
        'images/logo-titulos.png',
      url: 'https://www.gob.pe/941-consultar-titulos-de-instituciones-tecnologicas-y-pedagogicas',
      alt: 'Consulta de Títulos',
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
  private subscriptions: any[] = [];

  constructor(
    private renderer: Renderer2,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    // Cargar datos independientemente
    this.loadNoticias();
    this.loadComunicados();
    this.loadContact();
  }

  // Método independiente para cargar noticias
  loadNoticias(): void {
    this.loadingNoticias.set(true);
    this.errorNoticias.set(null);
    
    this.http.get<any[]>(`${this.api}/news/list`).subscribe({
      next: (data) => {
        // Validar que sea un array válido
        if (Array.isArray(data)) {
          this.latestNoticias.set(data.filter(n => n.status).slice(0, 3));
        } else {
          this.errorNoticias.set('Formato de respuesta inválido');
          this.latestNoticias.set([]);
        }
        this.loadingNoticias.set(false);
      },
      error: (err) => {
        console.error('Error cargando noticias:', err);
        this.errorNoticias.set('Error al cargar noticias');
        this.latestNoticias.set([]);
        this.loadingNoticias.set(false);
      }
    });
  }

  // Método de reintento para noticias
  retryNoticias(): void {
    this.loadNoticias();
  }

  // Método independiente para cargar comunicados
  loadComunicados(): void {
    this.loadingComunicados.set(true);
    this.errorComunicados.set(null);
    
    this.http.get<any[]>(`${this.api}/press_releases/list`).subscribe({
      next: (data) => {
        // Validar que sea un array válido
        if (Array.isArray(data)) {
          this.latestComunicados.set(data.filter(n => n.status).slice(0, 3));
        } else {
          this.errorComunicados.set('Formato de respuesta inválido');
          this.latestComunicados.set([]);
        }
        this.loadingComunicados.set(false);
      },
      error: (err) => {
        console.error('Error cargando comunicados:', err);
        this.errorComunicados.set('Error al cargar comunicados');
        this.latestComunicados.set([]);
        this.loadingComunicados.set(false);
      }
    });
  }

  // Método de reintento para comunicados
  retryComunicados(): void {
    this.loadComunicados();
  }

  // Método independiente para cargar contacto
  loadContact(): void {
    this.loadingContact.set(true);
    this.errorContact.set(null);
    
    this.http.get<any[]>(`${this.api}/contacts/list`).subscribe({
      next: (data) => {
        // Validar que sea un array válido
        if (Array.isArray(data) && data.length > 0) {
          this.contact.set(data[0]);
        } else {
          this.contact.set(null);
        }
        this.loadingContact.set(false);
      },
      error: (err) => {
        console.error('Error cargando contacto:', err);
        this.errorContact.set('Error al cargar información de contacto');
        this.contact.set(null);
        this.loadingContact.set(false);
      }
    });
  }

  // Método de reintento para contacto
  retryContact(): void {
    this.loadContact();
  }

  ngAfterViewInit() {
    this.cloneItems();
    this.startHeroSlideshow();

    this.ngZone.runOutsideAngular(() => {
      this.startAutoScroll();
      this.bindEvents();
    });
  }

  ngOnDestroy(): void {
    // Limpiar todos los listeners
    this.listeners.forEach(listener => listener());
    this.listeners = [];
    
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];

    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    if (this.heroInterval) clearInterval(this.heroInterval);
  }

  // Método nuevo:
  private startHeroSlideshow() {
    this.heroInterval = setInterval(() => {
      this.ngZone.run(() => {
        // ← Ejecutar dentro de Angular zone
        this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
        this.cdr.detectChanges(); // ← Forzar detección de cambios
      });
    }, 3000);
  }

  goToHeroSlide(index: number) {
    this.currentHeroIndex = index;
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

  // ── Loop infinito: clona los items al final del track ──
  private cloneItems() {
    const track = this.track.nativeElement as HTMLElement;
    const origItems = Array.from(track.children) as HTMLElement[];
    origItems.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  // ── Auto scroll ──
  private startAutoScroll() {
    const track = this.track.nativeElement as HTMLElement;
    const carousel = this.carousel.nativeElement as HTMLElement;

    const tick = () => {
      if (!this.isPaused && !this.isDragging) {
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
