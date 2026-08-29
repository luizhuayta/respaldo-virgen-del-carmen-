import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Sidebar } from '../sidebar/sidebar';
import { ToastHost } from '../compartido/toast-host';

const ROUTE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/noticias': 'Noticias',
  '/admin/comunicados': 'Comunicados',
  '/admin/personal-academico': 'Personal Académico',
  '/admin/trayectoria': 'Trayectoria',
  '/admin/contactos': 'Contactos',
  '/admin/investigaciones': 'Investigaciones',
  '/admin/usuarios': 'Usuarios',
  '/admin/documentos': 'Documentos',
  '/admin/mesa-de-partes': 'Mesa de partes',
  '/admin/admin-reclamaciones': 'Libro de Reclamaciones'
};

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, ToastHost],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private router = inject(Router);

  pageTitle = signal('Dashboard');

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.pageTitle.set(ROUTE_TITLES[e.urlAfterRedirects] ?? 'Admin');
      });
  }

  get today(): string {
    return new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
