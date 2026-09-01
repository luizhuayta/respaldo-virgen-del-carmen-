import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const EVA_URL = 'https://share.google/DsKX1Yyh9tc2eetBU';
const TEAMS_URL = 'https://www.microsoft.com/es-es/microsoft-teams/log-in';

export interface ServicioItem {
  titulo: string;
  descripcion: string;
  icono: string;
  route?: string;
  href?: string;
  soon?: boolean;
}

export interface ServicioGrupo {
  titulo: string;
  items: ServicioItem[];
}

@Component({
  selector: 'app-servicios',
  imports: [RouterLink],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios {
  grupos: ServicioGrupo[] = [
    {
      titulo: 'Para el estudiante',
      items: [
        {
          titulo: 'Plataforma EVA',
          descripcion: 'Entorno virtual de aprendizaje',
          icono: 'fas fa-laptop-code',
          href: EVA_URL,
        },
        {
          titulo: 'Aula Virtual',
          descripcion: 'Acceso a clases y recursos en línea',
          icono: 'fas fa-chalkboard-teacher',
          href: TEAMS_URL,
        },
        {
          titulo: 'Biblioteca Virtual',
          descripcion: 'Recursos bibliográficos digitales',
          icono: 'fas fa-book-open',
          href: TEAMS_URL,
        },
        {
          titulo: 'Soporte Psicopedagógico',
          descripcion: 'Orientación y acompañamiento al estudiante',
          icono: 'fas fa-brain',
          route: '/psicopedagogico',
        },
        {
          titulo: 'Soporte Médico',
          descripcion: 'Salud y bienestar de la comunidad educativa',
          icono: 'fas fa-heartbeat',
          route: '/soporte-medico',
        },
        {
          titulo: 'Servicio Social',
          descripcion: 'Atención y gestión del bienestar social',
          icono: 'fas fa-hands-helping',
          route: '/servicio-social',
        },
      ],
    },
    {
      titulo: 'Académico y trámites',
      items: [
        {
          titulo: 'Repositorio Institucional',
          descripcion: 'Documentos y trabajos académicos',
          icono: 'fas fa-database',
          route: '/repositorio',
        },
        {
          titulo: 'Unidad de Investigación',
          descripcion: 'Proyectos y producción académica',
          icono: 'fas fa-microscope',
          route: '/repositorio',
        },
        {
          titulo: 'Soporte Administrativo',
          descripcion: 'Trámites y mesa de partes virtual',
          icono: 'fas fa-file-alt',
          route: '/mesa-de-partes',
        },
      ],
    },
    {
      titulo: 'Egresados',
      items: [
        {
          titulo: 'Seguimiento al Egresado',
          descripcion: 'Acompañamiento e inserción laboral',
          icono: 'fas fa-user-graduate',
          route: '/estadisticas',
        },
        {
          titulo: 'Bolsa de Trabajo',
          descripcion: 'Oportunidades de empleo para egresados',
          icono: 'fas fa-briefcase',
          soon: true,
        },
      ],
    },
  ];
}
