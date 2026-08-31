import {
  Component,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  signal,
  inject,
  viewChild,
  computed
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../compartido/toast';
import { ToastHost } from '../compartido/toast-host';

interface Particle {
  x: number;
  y: number;
  diameter: number;
  duration: number;
  amplitude: number;
  offsetY: number;
  arc: number;
  startTime: number;
  colour: string;
}

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, ToastHost, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: { class: 'admin-login' }
})
export class AdminLogin implements AfterViewInit, OnDestroy {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  private canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('particleCanvas');
  private userInput = viewChild<ElementRef<HTMLInputElement>>('userInput');

  username = signal('');
  password = signal('');
  showPassword = signal(false);
  loading = signal(false);
  submitted = signal(false);

  showUserError = computed(() => this.submitted() && !this.username().trim());
  showPassError = computed(() => this.submitted() && !this.password());

  private rafId = 0;
  private particles: Particle[] = [];
  private reducedMotion = false;
  private paused = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private readonly SPEED = 20000;
  private readonly NUM_PARTICLES = 120;

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(this.safeReturnUrl());
    }
  }

  ngAfterViewInit() {
    this.userInput()?.nativeElement.focus();
    this.startAnimation();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  login() {
    this.submitted.set(true);

    if (this.loading() || this.showUserError() || this.showPassError()) {
      return;
    }

    this.loading.set(true);

    this.auth.login(this.username().trim(), this.password()).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);
        this.router.navigateByUrl(this.safeReturnUrl());
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.toast.error('Esta cuenta está desactivada. Consulte con el administrador.');
        } else if (err.status === 429) {
          this.toast.error('Demasiados intentos. Espere unos minutos e intente de nuevo.');
        } else if (err.status === 0) {
          this.toast.error('No se pudo conectar con el servidor.');
        } else {
          this.toast.error('Usuario o contraseña incorrectos');
        }
      }
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  private safeReturnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    if (url?.startsWith('/admin') && !url.startsWith('/admin/login')) {
      return url;
    }
    return '/admin/dashboard';
  }

  private rand(low: number, high: number) {
    return Math.random() * (high - low) + low;
  }

  private createParticle(): Particle {
    const isPrimary = Math.random() > 0.5;
    const colour = isPrimary
      ? { r: 50, g: 63, b: 124 }
      : { r: 196, g: 112, b: 0 };

    return {
      x: -2,
      y: -2,
      diameter: this.rand(0.28, 0.9),
      duration: this.rand(this.SPEED * 0.8, this.SPEED * 1.2),
      amplitude: this.rand(10, 20),
      offsetY: this.rand(-10, 10),
      arc: Math.PI * 2,
      startTime: performance.now() - this.rand(0, this.SPEED),
      colour: `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${this.rand(0.25, 0.7)})`,
    };
  }

  private moveParticle(particle: Particle, time: number) {
    const progress =
      ((time - particle.startTime) % particle.duration) / particle.duration;
    particle.x = progress;
    particle.y = Math.sin(progress * particle.arc) * particle.amplitude + particle.offsetY;
  }

  private drawParticle(particle: Particle) {
    const canvas = this.canvas;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;

    const vh = canvas.height / 100;
    ctx.fillStyle = particle.colour;
    ctx.beginPath();
    ctx.ellipse(
      particle.x * canvas.width,
      particle.y * vh + canvas.height / 2,
      particle.diameter * vh,
      particle.diameter * vh,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  private paintBackground() {
    const canvas = this.canvas;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0f2c');
    gradient.addColorStop(1, '#1a1f4f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private tick = (time: number) => {
    if (!this.canvas || !this.ctx) return;

    this.paintBackground();

    if (!this.reducedMotion) {
      for (const particle of this.particles) {
        this.moveParticle(particle, time);
        this.drawParticle(particle);
      }
    }

    if (!this.paused && !this.reducedMotion) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private resizeCanvas = () => {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    if (this.reducedMotion || this.paused) {
      this.paintBackground();
      if (!this.reducedMotion) {
        for (const particle of this.particles) {
          this.drawParticle(particle);
        }
      }
    }
  };

  private onResize = () => this.resizeCanvas();

  private onVisibility = () => {
    this.paused = document.hidden;
    if (this.paused) {
      cancelAnimationFrame(this.rafId);
      return;
    }
    if (!this.reducedMotion) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private startAnimation() {
    const el = this.canvasRef()?.nativeElement;
    if (!el) return;

    this.canvas = el;
    this.ctx = el.getContext('2d');
    if (!this.ctx) return;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);

    this.particles = [];
    if (!this.reducedMotion) {
      for (let i = 0; i < this.NUM_PARTICLES; i++) {
        this.particles.push(this.createParticle());
      }
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.paintBackground();
    }
  }
}
