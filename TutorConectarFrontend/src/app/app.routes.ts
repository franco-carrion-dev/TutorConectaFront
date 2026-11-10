import { Routes } from '@angular/router';
import { Disponibilidadcomponent } from './components/disponibilidadcomponent/disponibilidadcomponent';
import { Dlistcomponent } from './components/disponibilidadcomponent/dlistcomponent/dlistcomponent';
import { Dinsertcomponent } from './components/disponibilidadcomponent/dinsertcomponent/dinsertcomponent';
import { Reportecomponent } from './components/reportecomponent/reportecomponent';
import { Replistcomponent } from './components/reportecomponent/replistcomponent/replistcomponent';
import { Repinsertcomponent } from './components/reportecomponent/repinsertcomponent/repinsertcomponent';

export const routes: Routes = [
  { path: 'disponibilidades', component: Disponibilidadcomponent, children: [
    { path: '', component: Dlistcomponent },
    { path: 'nuevo', component: Dinsertcomponent },
  ]},
  { path: 'reportes', component: Reportecomponent, children: [
    { path: '', component: Replistcomponent },
    { path: 'nuevo', component: Repinsertcomponent },
  ]},
  { path: '', redirectTo: 'disponibilidades', pathMatch: 'full' },
];