import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }

  dashboard = {
    label: 'Dashboard',
    icon: 'fas fa-tachometer-alt',
    route: '/admin/dashboard',
  };

  menuGroups = [
    {
      label: 'Bandeja',
      items: [
        {
          label: 'Mesa de Partes',
          icon: 'fa-solid fa-inbox',
          route: '/admin/mesa-de-partes',
        },
        {
          label: 'Libro de Reclamaciones',
          icon: 'fa-solid fa-book-open',
          route: '/admin/admin-reclamaciones',
        },
      ],
    },
    {
      label: 'Portal',
      items: [
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
          label: 'Documentos',
          icon: 'fa-solid fa-file-circle-plus',
          route: '/admin/documentos',
        },
      ],
    },
    {
      label: 'Instituto',
      items: [
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
          label: 'Trayectoria',
          icon: 'fa-solid fa-briefcase',
          route: '/admin/trayectoria',
        },
        {
          label: 'Contactos',
          icon: 'fa-solid fa-address-book',
          route: '/admin/contactos',
        },
        {
          label: 'Usuarios',
          icon: 'fa-solid fa-users-gear',
          route: '/admin/usuarios',
        },
      ],
    },
  ];
}
