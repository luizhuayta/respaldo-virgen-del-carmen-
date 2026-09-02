import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

let workerListo = false;

function asegurarApisPdf() {
  const mapProto = Map.prototype as Map<unknown, unknown> & {
    getOrInsert?: (key: unknown, value: unknown) => unknown;
    getOrInsertComputed?: (key: unknown, fn: (key: unknown) => unknown) => unknown;
  };
  if (!mapProto.getOrInsert) {
    mapProto.getOrInsert = function (key, value) {
      if (!this.has(key)) this.set(key, value);
      return this.get(key);
    };
  }
  if (!mapProto.getOrInsertComputed) {
    mapProto.getOrInsertComputed = function (key, fn) {
      if (!this.has(key)) this.set(key, fn(key));
      return this.get(key);
    };
  }
}

/** Área máxima de píxeles reales por lienzo: evita lienzos gigantes que el
 *  navegador no puede pintar (se quedan en negro) en documentos muy grandes. */
const MAX_AREA_LIENZO = 16_777_216; // 4096 × 4096

function esCancelacion(e: unknown): boolean {
  return !!e && typeof e === 'object' && (e as { name?: string }).name === 'RenderingCancelledException';
}

@Component({
  selector: 'app-lector-pdf',
  standalone: true,
  templateUrl: './lector-pdf.html',
  styleUrl: './lector-pdf.css',
  host: {
    '[class.compacto]': 'compact()',
  },
})
export class LectorPdf {
  readonly src = input<string | null>(null);
  readonly title = input('');
  readonly compact = input(false, { transform: booleanAttribute });
  readonly toolbar = input(true, { transform: booleanAttribute });

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private readonly cuerpo = viewChild<ElementRef<HTMLElement>>('cuerpo');
  private readonly lienzos = viewChildren<ElementRef<HTMLCanvasElement>>('lienzo');

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly paginas = signal(0);
  readonly pagina = signal(1);
  readonly zoom = signal(1);
  readonly numeros = signal<number[]>([]);
  readonly descargando = signal(false);

  readonly mostrarBarra = computed(() => this.toolbar() && !this.compact());
  readonly zoomPct = computed(() => Math.round(this.zoom() * 100));
  readonly tituloVisible = computed(() => {
    const t = this.title().trim();
    return t || this.nombreArchivo();
  });

  private pdf: PDFDocumentProxy | null = null;
  private tarea: PDFDocumentLoadingTask | null = null;
  private cargaId = 0;
  private resizeObs?: ResizeObserver;
  private io?: IntersectionObserver;
  /** clave de escala con la que se pintó cada página (para no repintar en vano) */
  private pintadas = new Map<number, string>();
  /** render en curso por página; se cancela antes de relanzar sobre el mismo lienzo */
  private tareasRender = new Map<number, RenderTask>();
  /** contador por página para descartar peticiones de pintado obsoletas */
  private genPintar = new Map<number, number>();
  private resizeDebounce: ReturnType<typeof setTimeout> | undefined;
  private repintarPend: ReturnType<typeof setTimeout> | undefined;
  private scrollRepintar: ReturnType<typeof setTimeout> | undefined;
  private tamPagina = { w: 612, h: 792 };
  private caja = { w: 0, h: 0 };
  private escalaAjuste = 1;

  constructor() {
    effect(() => {
      const url = this.src();
      untracked(() => void this.abrir(url));
    });

    effect(() => {
      this.lienzos();
      this.numeros();
      untracked(() => {
        this.pintadas.clear();
        this.observarPaginas();
      });
    });

    afterNextRender(() => this.observarCaja());

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.resizeDebounce);
      clearTimeout(this.repintarPend);
      clearTimeout(this.scrollRepintar);
      this.resizeObs?.disconnect();
      this.io?.disconnect();
      void this.liberar();
    });
  }

  zoomMenos() {
    this.zoom.update(z => Math.max(0.5, Math.round((z - 0.15) * 100) / 100));
    this.reRenderizar();
  }

  zoomMas() {
    this.zoom.update(z => Math.min(3, Math.round((z + 0.15) * 100) / 100));
    this.reRenderizar();
  }

  restablecerZoom() {
    if (this.zoom() === 1) return;
    this.zoom.set(1);
    this.reRenderizar();
  }

  irPagina(delta: number) {
    const destino = Math.min(this.paginas(), Math.max(1, this.pagina() + delta));
    const el = this.cuerpo()?.nativeElement.querySelector(`[data-pagina="${destino}"]`);
    el?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    this.pagina.set(destino);
  }

  abrirNueva() {
    const url = this.src();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  async descargar() {
    const url = this.src();
    if (!url || this.descargando()) return;
    this.descargando.set(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch');
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = this.nombreArchivo();
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      this.abrirNueva();
    } finally {
      this.descargando.set(false);
    }
  }

  reintentar() {
    void this.abrir(this.src());
  }

  onScroll() {
    const wrap = this.cuerpo()?.nativeElement;
    if (!wrap) return;
    const medio = wrap.scrollTop + wrap.clientHeight * 0.35;
    let actual = 1;
    wrap.querySelectorAll<HTMLElement>('[data-pagina]').forEach(el => {
      if (el.offsetTop <= medio) actual = Number(el.dataset['pagina']) || 1;
    });
    this.pagina.set(actual);

    // red de seguridad: si un scroll rápido dejó páginas sin pintar, el
    // IntersectionObserver puede no haberlas capturado
    clearTimeout(this.scrollRepintar);
    this.scrollRepintar = setTimeout(() => this.pintarVisibles(), 90);
  }

  private nombreArchivo(): string {
    const url = this.src() ?? '';
    try {
      const path = new URL(url, window.location.origin).pathname;
      const last = path.split('/').filter(Boolean).pop();
      return last ? decodeURIComponent(last) : 'documento.pdf';
    } catch {
      return 'documento.pdf';
    }
  }

  private observarCaja() {
    this.resizeObs?.disconnect();
    const el = this.compact() ? this.host.nativeElement : this.cuerpo()?.nativeElement;
    if (!el) return;
    this.resizeObs = new ResizeObserver(entries => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      const w = Math.round(cr.width);
      const h = Math.round(cr.height);
      if (Math.abs(w - this.caja.w) < 3 && Math.abs(h - this.caja.h) < 3) return;
      this.caja = { w, h };
      this.recalcularAjuste();
      // agrupar ráfagas de "resize" mientras el layout se estabiliza
      clearTimeout(this.resizeDebounce);
      this.resizeDebounce = setTimeout(() => this.reRenderizar(), 120);
    });
    this.resizeObs.observe(el);
  }

  private recalcularAjuste() {
    const { w, h } = this.tamPagina;
    const caja = this.caja;
    if (!w || !h || caja.w < 8) {
      this.escalaAjuste = 1;
      return;
    }
    if (this.compact()) {
      const alto = caja.h < 8 ? caja.w * 1.3 : caja.h;
      this.escalaAjuste = Math.max(0.1, Math.min(caja.w / w, alto / h));
    } else {
      // ajustar al ancho disponible, con un techo razonable en pantallas anchas
      const disponible = Math.max(120, caja.w - 32);
      this.escalaAjuste = Math.max(0.2, Math.min(disponible / w, 2));
    }
  }

  private reRenderizar() {
    for (const [, t] of this.tareasRender) t.cancel();
    this.pintadas.clear();
    this.observarPaginas();
    // repintar lo que ya está a la vista (el IntersectionObserver solo reacciona
    // a cambios de intersección, no a un cambio de escala). Se hace tras un
    // frame para que las tareas canceladas liberen sus lienzos.
    clearTimeout(this.repintarPend);
    this.repintarPend = setTimeout(() => this.pintarVisibles(), 0);
    requestAnimationFrame(() => this.pintarVisibles());
  }

  private claveEscala(): string {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    return `${this.escalaAjuste.toFixed(3)}|${this.zoom().toFixed(2)}|${dpr}`;
  }

  private pintarVisibles() {
    const wrap = this.cuerpo()?.nativeElement;
    if (this.compact()) {
      const c = this.lienzos()[0]?.nativeElement;
      if (c) void this.pintar(1, c);
      return;
    }
    if (!wrap) return;
    const min = wrap.scrollTop - wrap.clientHeight;
    const max = wrap.scrollTop + wrap.clientHeight * 2;
    wrap.querySelectorAll<HTMLElement>('[data-pagina]').forEach(el => {
      if (el.offsetTop + el.offsetHeight >= min && el.offsetTop <= max) {
        const n = Number(el.dataset['pagina']);
        const canvas = el.querySelector('canvas');
        if (n && canvas) void this.pintar(n, canvas);
      }
    });
  }

  private observarPaginas() {
    this.io?.disconnect();
    const root = this.cuerpo()?.nativeElement ?? null;
    const lienzos = this.lienzos();
    if (!lienzos.length) return;

    if (this.compact()) {
      void this.pintar(1, lienzos[0].nativeElement);
      return;
    }

    this.io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const n = Number((e.target as HTMLElement).dataset['pagina']);
          const canvas = (e.target as HTMLElement).querySelector('canvas');
          if (n && canvas) void this.pintar(n, canvas);
        }
      },
      { root, rootMargin: '300px 0px', threshold: 0.01 },
    );

    root?.querySelectorAll<HTMLElement>('[data-pagina]').forEach(el => this.io!.observe(el));
  }

  private async abrir(url: string | null) {
    const id = ++this.cargaId;
    await this.liberar();
    this.numeros.set([]);
    this.paginas.set(0);
    this.pagina.set(1);
    this.error.set(null);
    this.pintadas.clear();

    if (!url) {
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      asegurarApisPdf();
      if (!workerListo) {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
        workerListo = true;
      }
      this.tarea = pdfjs.getDocument({
        url,
        withCredentials: false,
        cMapUrl: '/pdfjs/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/pdfjs/standard_fonts/',
        iccUrl: '/pdfjs/iccs/',
      });
      const pdf = await this.tarea.promise;
      if (id !== this.cargaId) {
        await pdf.destroy();
        return;
      }
      this.pdf = pdf;
      const first = await pdf.getPage(1);
      const vp = first.getViewport({ scale: 1 });
      this.tamPagina = { w: vp.width, h: vp.height };
      this.recalcularAjuste();
      const total = pdf.numPages;
      const max = this.compact() ? 1 : total;
      this.paginas.set(total);
      this.numeros.set(Array.from({ length: max }, (_, i) => i + 1));
      this.cargando.set(false);
      queueMicrotask(() => {
        this.observarCaja();
        this.observarPaginas();
        this.pintarVisibles();
      });
    } catch (e) {
      if (id !== this.cargaId || esCancelacion(e)) return;
      this.cargando.set(false);
      this.error.set('No se pudo abrir el documento.');
    }
  }

  private async pintar(n: number, canvas: HTMLCanvasElement) {
    const pdf = this.pdf;
    if (!pdf) return;

    const clave = this.claveEscala();
    if (this.pintadas.get(n) === clave) return;

    // marca de generación: si llega otra petición para esta misma página
    // mientras esperamos, esta queda obsoleta y se aborta
    const gen = (this.genPintar.get(n) ?? 0) + 1;
    this.genPintar.set(n, gen);
    const vigente = () => this.genPintar.get(n) === gen && this.pdf === pdf;

    // cancelar cualquier render anterior sobre este mismo lienzo y esperar a que
    // libere el canvas (pdf.js rechaza dos render() simultáneos sobre el mismo)
    const previa = this.tareasRender.get(n);
    if (previa) {
      previa.cancel();
      try {
        await previa.promise;
      } catch {
        /* RenderingCancelledException esperada */
      }
      if (this.tareasRender.get(n) === previa) this.tareasRender.delete(n);
    }
    if (!vigente() || this.pintadas.get(n) === clave) return;

    let tarea: RenderTask | null = null;
    try {
      const page = await pdf.getPage(n);
      if (!vigente()) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let escala = Math.max(0.05, this.escalaAjuste * this.zoom() * dpr);
      let viewport = page.getViewport({ scale: escala });

      // limitar el área para no generar un lienzo que el navegador deje en negro
      const area = viewport.width * viewport.height;
      if (area > MAX_AREA_LIENZO) {
        escala *= Math.sqrt(MAX_AREA_LIENZO / area);
        viewport = page.getViewport({ scale: escala });
      }

      const cw = Math.max(1, Math.floor(viewport.width));
      const ch = Math.max(1, Math.floor(viewport.height));
      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = `${Math.floor(cw / dpr)}px`;
      canvas.style.height = `${Math.floor(ch / dpr)}px`;

      // lienzo opaco + relleno blanco: evita que las zonas con máscara suave
      // o grupos de transparencia se compongan sobre negro (páginas "negras")
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, ch);
      }

      tarea = page.render({ canvas, viewport, background: '#ffffff' });
      this.tareasRender.set(n, tarea);
      await tarea.promise;
      this.pintadas.set(n, clave);
    } catch (e) {
      // si se canceló, otra petición se encargará; si falló de verdad, se deja
      // el lienzo en blanco y un resize/scroll posterior lo reintenta
      this.pintadas.delete(n);
      if (!esCancelacion(e)) {
        console.debug('lector-pdf: no se pudo pintar la página', n, e);
      }
    } finally {
      if (tarea && this.tareasRender.get(n) === tarea) this.tareasRender.delete(n);
    }
  }

  private async liberar() {
    this.io?.disconnect();
    for (const [, t] of this.tareasRender) t.cancel();
    this.tareasRender.clear();
    this.tarea?.destroy();
    this.tarea = null;
    if (this.pdf) {
      const doc = this.pdf;
      this.pdf = null;
      try {
        await doc.destroy();
      } catch {
        /* ignore */
      }
    }
  }
}
