import { Routes } from '@angular/router';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { Dashboard } from './admin/dashboard/dashboard';
import { AdminNoticias } from './admin/noticias/admin-noticias';
import { AdminComunicados } from './admin/comunicados/admin-comunicados';
import { AdminPersonal } from './admin/personal-academico/admin-personal';
import { AdminTrayectoria } from './admin/trayectoria/trayectoria';
import { AdminContactos } from './admin/contactos/contactos';
import { AdminUsuarios } from './admin/usuarios/usuarios';
import { AdminDocumentos } from './admin/documentos/documentos';
import { AdminLogin } from './admin/login/login';
import { MesaDePartesAdmin } from './admin/mesa-de-partes/mesa-de-partes';
import { Inicio } from './pages/inicio/inicio';
import { Nosotros } from './pages/nosotros/nosotros';
import { Noticias } from './pages/noticias/noticias';
import { Programas } from './pages/programas/programas';
import { Transparencia } from './pages/transparencia/transparencia';
import { Admision } from './pages/admision/admision';
import { BecasYCreditos } from './pages/becas-y-creditos/becas-y-creditos';
import { Costos } from './pages/costos/costos';
import { Reglamentos } from './pages/reglamentos/reglamentos';
import { Inversiones } from './pages/inversiones/inversiones';
import { Procedimientos } from './pages/procedimientos/procedimientos';
import { Horarios } from './pages/horarios/horarios';
import { Psicopedagogico } from './pages/psicopedagógico/psicopedagógico';
import { SoporteMedico } from './pages/soporte-medico/soporte-medico';
import { ServicioSocial } from './pages/servicio-social/servicio-social';
import { MesaDePartes } from './pages/mesa-de-partes/mesa-de-partes';
import { Licenciamiento } from './pages/licenciamiento/licenciamiento';
import { Servicios } from './pages/servicios/servicios';
import { AdminInvestigaciones } from './admin/investigaciones/investigaciones';
import { Estadisticas } from './pages/estadisticas/estadisticas';
import { Repositorio } from './pages/repositorio/repositorio';
import { RepositorioDetalle } from './pages/repositorio-detalle/repositorio-detalle';
import { NoticiaDetalle } from './pages/noticia-detalle/noticia-detalle';
import { authGuard } from './core/auth/auth.guard';
import { PublicLayout } from './layout/public-layout/public-layout';
import { Reclamaciones } from './pages/reclamaciones/reclamaciones';
import { AdminReclamaciones } from './admin/admin-reclamaciones/admin-reclamaciones';

export const routes: Routes = [
  { path: 'admin/login', component: AdminLogin, title: 'Admin — Login' },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard, title: 'Admin — Dashboard' },
      { path: 'noticias', component: AdminNoticias, title: 'Admin — Noticias' },
      { path: 'comunicados', component: AdminComunicados, title: 'Admin — Comunicados' },
      { path: 'personal-academico', component: AdminPersonal, title: 'Admin — Personal Académico' },
      { path: 'trayectoria', component: AdminTrayectoria, title: 'Admin - Trayectoria' },
      { path: 'contactos', component: AdminContactos, title: 'Admin - Contactos' },
      { path: 'investigaciones', component: AdminInvestigaciones, title: 'Admin - Investigaciones' },
      { path: 'usuarios', component: AdminUsuarios, title: 'Admin - Usuarios' },
      { path: 'documentos', component: AdminDocumentos, title: 'Admin - Documentos' },
      { path: 'mesa-de-partes', component: MesaDePartesAdmin, title: 'Admin — Mesa de Partes' },
      { path: 'admin-reclamaciones', component: AdminReclamaciones, title: 'Admin - Reclamaciones' }
    ],
  },
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio, title: 'Inicio' },
      { path: 'nosotros', component: Nosotros, title: 'Nosotros' },
      { path: 'noticias', component: Noticias, title: 'Noticias' },
      { path: 'noticias/:id', component: NoticiaDetalle, title: 'Detalle Noticia', data: { tipo: 'noticias' } },
      { path: 'comunicado/:id', component: NoticiaDetalle, title: 'Detalle Comunicado', data: { tipo: 'comunicado' } },
      { path: 'programas', component: Programas, title: 'Programas' },
      { path: 'admision', component: Admision, title: 'Admision' },
      { path: 'transparencia', component: Transparencia, title: 'Transparencia' },
      { path: 'becas', component: BecasYCreditos, title: 'Becas y Créditos' },
      { path: 'costos', component: Costos, title: 'Costos' },
      { path: 'reglamentos', component: Reglamentos, title: 'Reglamentos' },
      { path: 'inversiones', component: Inversiones, title: 'Inversiones' },
      { path: 'procedimientos', component: Procedimientos, title: 'Procedimientos' },
      { path: 'horarios', component: Horarios, title: 'Horarios' },
      { path: 'psicopedagogico', component: Psicopedagogico, title: 'Soporte Psicopedagógico' },
      { path: 'servicios', component: Servicios, title: 'Servicios' },
      { path: 'soporte-medico', component: SoporteMedico, title: 'Soporte Médico' },
      { path: 'servicio-social', component: ServicioSocial, title: 'Servicio Social' },
      { path: 'mesa-de-partes', component: MesaDePartes, title: 'Mesa de Partes Virtual' },
      { path: 'licenciamiento', component: Licenciamiento, title: 'Licenciamiento' },
      { path: 'estadisticas', component: Estadisticas, title: 'Estadisticas' },
      { path: 'repositorio', component: Repositorio, title: 'Repositorio Institucional' },
      { path: 'repositorio/:id', component: RepositorioDetalle, title: 'Detalle — Repositorio' },
      { path: 'reclamaciones', component: Reclamaciones, title: 'Reclamaciones' }
    ]
  }
];