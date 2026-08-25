import {
  Component,
  signal,
  inject,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class AdminLogin implements AfterViewInit {

  private router = inject(Router);

  username = signal('');
  password = signal('');

  private auth = inject(AuthService);

  login() {

    this.auth.login(
      this.username(),
      this.password()
    ).subscribe({

      next: (res) => {

        this.auth.saveToken(res.token);

        this.router.navigate([
          '/admin/dashboard'
        ]);
      },

      error: (err) => {

        console.error(err);

        alert('Usuario o contraseña incorrectos');
      }
    });
  }

  /* ANIMACIÓN CANVAS */

  ngAfterViewInit() {
    this.startAnimation();
  }

  NUM_PARTICLES = 600;
  PARTICLE_SIZE = 0.5;
  SPEED = 20000;

  particles: any[] = [];

  rand(low: number, high: number) {
    return Math.random() * (high - low) + low;
  }

  createParticle() {
    const isPrimary = Math.random() > 0.5;

    const colour = isPrimary
      ? { r: 50, g: 63, b: 124 }     // #323f7c
      : { r: 196, g: 112, b: 0 };    // #c47000

    return {
      x: -2,
      y: -2,
      diameter: Math.max(0, this.rand(0.2, 0.8)),
      duration: this.rand(this.SPEED * 0.8, this.SPEED * 1.2),
      amplitude: this.rand(10, 20),
      offsetY: this.rand(-10, 10),
      arc: Math.PI * 2,
      startTime: performance.now() - this.rand(0, this.SPEED),
      colour: `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${this.rand(0.2, 0.7)})`,
    };
  }

  moveParticle(particle: any, time: number) {
    const progress =
      ((time - particle.startTime) % particle.duration) / particle.duration;

    return {
      ...particle,
      x: progress,
      y:
        Math.sin(progress * particle.arc) * particle.amplitude +
        particle.offsetY,
    };
  }

  drawParticle(particle: any, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
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

  draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, time: number) {

    // FONDO (clave)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0f2c');     // oscuro
    gradient.addColorStop(1, '#1a1f4f');     // transición

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // mover partículas
    this.particles = this.particles.map(p =>
      this.moveParticle(p, time)
    );

    // dibujar partículas
    this.particles.forEach(p =>
      this.drawParticle(p, canvas, ctx)
    );

    requestAnimationFrame((t) => this.draw(canvas, ctx, t));
  }

  startAnimation() {
    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };

    resize();
    window.addEventListener('resize', resize);

    this.particles = [];
    for (let i = 0; i < this.NUM_PARTICLES; i++) {
      this.particles.push(this.createParticle());
    }

    requestAnimationFrame((t) => this.draw(canvas, ctx, t));
  }

  showPassword = signal(false);
  togglePassword() {
    this.showPassword.update(v => !v);
  }
}