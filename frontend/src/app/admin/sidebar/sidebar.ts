import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private router = inject(Router);

  logout() {

    sessionStorage.removeItem('token');

    this.router.navigate([
      '/admin/login'
    ]);
  }
  
  menuItems = [
    {
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/admin/dashboard',
    },
    {
      label: 'Noticias',
      icon: 'fas fa-newspaper',
      route: '/admin/noticias',
    },
    {
      label: 'Comunicados',
      icon: 'fas fa-bullhorn',
      route: '/admin/comunicados',
    },
    {
      label: 'Personal Académico',
      icon: 'fa-solid fa-chalkboard-user',
      route: '/admin/personal-academico',
    },
    {
      label: 'Investigaciones',
      icon: 'fa-solid fa-book-bookmark',
      route: '/admin/investigaciones',
    },
    {
      label: 'Documentos',
      icon: 'fa-solid fa-file-circle-plus',
      route: '/admin/documentos',
    },
    {
      label: 'Usuarios',
      icon: 'fa-solid fa-users-gear',
      route: '/admin/usuarios',
    },
    {
      label: 'Mesa de Partes',
      icon: 'fa-solid fa-address-book',
      route: '/admin/mesa-de-partes',
    },
    {
      label: 'Reclamos',
      icon: 'fa-solid fa-book-open',
      route: '/admin/admin-reclamaciones',
    },
    {
      label: 'Trayectoria',
      icon: 'fa-solid fa-briefcase',
      route: '/admin/trayectoria',
    },
    {
      label: 'Contactos',
      icon: 'fa-solid fa-address-book',
      route: '/admin/contactos',
    }
  ];
}
