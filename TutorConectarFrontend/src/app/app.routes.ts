import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, rolGuard } from './core/guards';
import { Layoutcomponent } from './shared/layoutcomponent';
import { Logincomponent } from './pages/auth/logincomponent';
import { Registrocomponent } from './pages/auth/registrocomponent';
import { Dashboardcomponent } from './pages/admin/dashboardcomponent';
import { Estadisticascomponent } from './pages/admin/estadisticas/estadisticascomponent';
import { Ulistcomponent } from './pages/admin/usuarios/ulistcomponent';
import { Uinsertcomponent } from './pages/admin/usuarios/uinsertcomponent';
import { Rlistcomponent } from './pages/admin/roles/rlistcomponent';
import { Rinsertcomponent } from './pages/admin/roles/rinsertcomponent';
import { Mlistcomponent } from './pages/admin/materias/mlistcomponent';
import { Minsertcomponent } from './pages/admin/materias/minsertcomponent';
import { Tlistcomponent } from './pages/admin/tutores/tlistcomponent';
import { Tinsertcomponent } from './pages/admin/tutores/tinsertcomponent';
import { Elistcomponent } from './pages/admin/estudiantes/elistcomponent';
import { Einsertcomponent } from './pages/admin/estudiantes/einsertcomponent';
import { Dlistcomponent } from './pages/admin/disponibilidades/dlistcomponent';
import { Dinsertcomponent } from './pages/admin/disponibilidades/dinsertcomponent';
import { Slistcomponent } from './pages/admin/sesiones/slistcomponent';
import { Sinsertcomponent } from './pages/admin/sesiones/sinsertcomponent';
import { Plistcomponent } from './pages/admin/pagos/plistcomponent';
import { Pinsertcomponent } from './pages/admin/pagos/pinsertcomponent';
import { Clistcomponent } from './pages/admin/calificaciones/clistcomponent';
import { Cinsertcomponent } from './pages/admin/calificaciones/cinsertcomponent';
import { Replistcomponent } from './pages/admin/reportes/replistcomponent';
import { Repinsertcomponent } from './pages/admin/reportes/repinsertcomponent';
import { Tpanelcomponent } from './pages/tutor/tpanelcomponent';
import { Tsesionescomponent } from './pages/tutor/tsesionescomponent';
import { Epanelcomponent } from './pages/estudiante/epanelcomponent';
import { Ebuscarcomponent } from './pages/estudiante/ebuscarcomponent';
import { Eperfiltutorcomponent } from './pages/estudiante/eperfiltutorcomponent';
import { Esesionescomponent } from './pages/estudiante/esesionescomponent';
import { Epagocomponent } from './pages/estudiante/epagocomponent';
import { Epagoscomponent } from './pages/estudiante/epagoscomponent';
import { Salacomponent } from './pages/sala/salacomponent';
import { Iniciocomponent } from './pages/iniciocomponent';

/** CRUD estándar: listar / nuevo / editar/:id */
const crud = (path: string, list: any, form: any) => [
  { path, component: list },
  { path: `${path}/nuevo`, component: form },
  { path: `${path}/editar/:id`, component: form },
]

export const routes: Routes = [
  { path: 'login', component: Logincomponent, canActivate: [invitadoGuard] },
  { path: 'registro', component: Registrocomponent, canActivate: [invitadoGuard] },
  {
    path: '', component: Layoutcomponent, canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', component: Iniciocomponent },
      {
        path: 'admin', canActivate: [rolGuard], data: { roles: ['ADMIN'] },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          { path: 'dashboard', component: Dashboardcomponent },
          { path: 'estadisticas', component: Estadisticascomponent },
          ...crud('usuarios', Ulistcomponent, Uinsertcomponent),
          ...crud('roles', Rlistcomponent, Rinsertcomponent),
          ...crud('materias', Mlistcomponent, Minsertcomponent),
          ...crud('tutores', Tlistcomponent, Tinsertcomponent),
          ...crud('estudiantes', Elistcomponent, Einsertcomponent),
          ...crud('disponibilidades', Dlistcomponent, Dinsertcomponent),
          ...crud('sesiones', Slistcomponent, Sinsertcomponent),
          ...crud('pagos', Plistcomponent, Pinsertcomponent),
          ...crud('calificaciones', Clistcomponent, Cinsertcomponent),
          ...crud('reportes', Replistcomponent, Repinsertcomponent),
        ],
      },
      {
        path: 'tutor', canActivate: [rolGuard], data: { roles: ['TUTOR'] },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'panel' },
          { path: 'panel', component: Tpanelcomponent },
          { path: 'sesiones', component: Tsesionescomponent },
          ...crud('disponibilidad', Dlistcomponent, Dinsertcomponent),
          ...crud('reportes', Replistcomponent, Repinsertcomponent),
          { path: 'perfil', component: Tinsertcomponent },
        ],
      },
      {
        path: 'estudiante', canActivate: [rolGuard], data: { roles: ['ESTUDIANTE'] },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'panel' },
          { path: 'panel', component: Epanelcomponent },
          { path: 'buscar', component: Ebuscarcomponent },
          { path: 'tutor/:id', component: Eperfiltutorcomponent },
          { path: 'sesiones', component: Esesionescomponent },
          { path: 'pago/:id', component: Epagocomponent },
          { path: 'pagos', component: Epagoscomponent },
          { path: 'perfil', component: Einsertcomponent },
        ],
      },
      { path: 'sala/:id', component: Salacomponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
