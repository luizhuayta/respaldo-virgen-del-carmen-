import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private api = environment.apiUrl;

  totalNoticias = signal(0);
  totalComunicados = signal(0);
  totalPersonal = signal(0);

  recentNoticias = signal<any[]>([]);
  recentComunicados = signal<any[]>([]);
  recentPersonal = signal<any[]>([]);

  pendientesMesa = signal<any[]>([]);
  pendientesReclamos = signal<any[]>([]);

  actividadReciente = computed(() => {
    const items = [
      ...this.recentNoticias().map(n => ({
        id: `n-${n.id}`,
        kind: 'noticia',
        text: `Noticia "${n.title}" publicada`,
        date: n.createdAt || n.updatedAt,
      })),
      ...this.recentComunicados().map(c => ({
        id: `c-${c.id}`,
        kind: 'comunicado',
        text: `Comunicado "${c.title}" emitido`,
        date: c.createdAt || c.updatedAt,
      })),
      ...this.recentPersonal().map(p => ({
        id: `p-${p.id}`,
        kind: 'personal',
        text: `${p.type} ${p.names} ${p.last_names} registrado/a`,
        date: p.createdAt || p.updatedAt,
      })),
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  ngOnInit(): void {
    this.http.get<any[]>(`${this.api}/news/list`).subscribe({
      next: data => {
        const activos = data.filter(d => d.status);
        this.totalNoticias.set(activos.length);
        this.recentNoticias.set(activos.slice(-3).reverse());
      },
      error: () => this.toast.error('No se pudieron cargar las noticias.'),
    });

    this.http.get<any[]>(`${this.api}/press_releases/list`).subscribe({
      next: data => {
        const activos = data.filter(d => d.status);
        this.totalComunicados.set(activos.length);
        this.recentComunicados.set(activos.slice(-3).reverse());
      },
      error: () => this.toast.error('No se pudieron cargar los comunicados.'),
    });

    this.http.get<any[]>(`${this.api}/academic_personal/list`).subscribe({
      next: data => {
        const activos = data.filter(d => d.status);
        this.totalPersonal.set(activos.length);
        this.recentPersonal.set(activos.slice(-3).reverse());
      },
      error: () => this.toast.error('No se pudo cargar el personal académico.'),
    });

    this.http.get<any[]>(`${this.api}/digital_intake_office/list`).subscribe({
      next: data => {
        const pendientes = data
          .filter(t => t.processing_status === 'Pendiente')
          .sort((a, b) => this.fechaMs(a) - this.fechaMs(b));
        this.pendientesMesa.set(pendientes);
      },
      error: () => this.toast.error('No se pudo cargar Mesa de Partes.'),
    });

    this.http.get<any[]>(`${this.api}/reclamaciones/list`).subscribe({
      next: data => {
        const pendientes = data
          .filter(r => r.processing_status === 'Pendiente')
          .sort((a, b) => this.fechaMs(a) - this.fechaMs(b));
        this.pendientesReclamos.set(pendientes);
      },
      error: () => this.toast.error('No se pudo cargar el Libro de Reclamaciones.'),
    });
  }

  antiguosMesa(): any[] {
    return this.pendientesMesa().slice(0, 3);
  }

  antiguosReclamos(): any[] {
    return this.pendientesReclamos().slice(0, 3);
  }

  nombreReclamo(r: any): string {
    return `${r.nombres ?? ''} ${r.apellido_paterno ?? ''} ${r.apellido_materno ?? ''}`.trim();
  }

  nombreTramite(t: any): string {
    return t.full_name || t.nombre || '—';
  }

  private fechaMs(item: any): number {
    const raw = item.created_at || item.fecha || item.createdAt || item.updatedAt;
    const t = new Date(raw).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
}
