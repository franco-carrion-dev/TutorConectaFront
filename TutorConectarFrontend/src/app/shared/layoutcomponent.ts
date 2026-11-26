import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Loginservice } from '../core/loginservice';
import { InicialesPipe } from './pipes';

interface Item { ruta: string; texto: string; icono: string }

const MENU: Record<string, Item[]> = {
  ADMIN: [
    { ruta: '/admin/dashboard', texto: 'Reportes y dashboard', icono: 'insights' },
    { ruta: '/admin/estadisticas', texto: 'Estadísticas', icono: 'bar_chart' },
    { ruta: '/admin/usuarios', texto: 'Usuarios', icono: 'group' },
    { ruta: '/admin/roles', texto: 'Roles', icono: 'admin_panel_settings' },
    { ruta: '/admin/tutores', texto: 'Tutores', icono: 'school' },
    { ruta: '/admin/estudiantes', texto: 'Estudiantes', icono: 'face' },
    { ruta: '/admin/materias', texto: 'Materias', icono: 'menu_book' },
    { ruta: '/admin/disponibilidades', texto: 'Disponibilidad horaria', icono: 'schedule' },
    { ruta: '/admin/sesiones', texto: 'Sesiones', icono: 'event' },
    { ruta: '/admin/pagos', texto: 'Pagos y disputas', icono: 'payments' },
    { ruta: '/admin/calificaciones', texto: 'Calificaciones', icono: 'star' },
    { ruta: '/admin/reportes', texto: 'Reportes de progreso', icono: 'trending_up' },
  ],
  TUTOR: [
    { ruta: '/tutor/panel', texto: 'Mi panel', icono: 'dashboard' },
    { ruta: '/tutor/sesiones', texto: 'Mis sesiones', icono: 'event' },
    { ruta: '/tutor/disponibilidad', texto: 'Mi disponibilidad', icono: 'schedule' },
    { ruta: '/tutor/reportes', texto: 'Reportes de progreso', icono: 'trending_up' },
    { ruta: '/tutor/perfil', texto: 'Mi perfil', icono: 'person' },
  ],
  ESTUDIANTE: [
    { ruta: '/estudiante/panel', texto: 'Mi panel', icono: 'dashboard' },
    { ruta: '/estudiante/buscar', texto: 'Buscar tutores', icono: 'search' },
    { ruta: '/estudiante/sesiones', texto: 'Mis sesiones', icono: 'event' },
    { ruta: '/estudiante/pagos', texto: 'Mis pagos', icono: 'receipt_long' },
    { ruta: '/estudiante/perfil', texto: 'Mi perfil', icono: 'person' },
  ],
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, InicialesPipe],
  templateUrl: './layoutcomponent.html',
  styleUrl: './layoutcomponent.css',
})
export class Layoutcomponent {
  auth = inject(Loginservice)
  private router = inject(Router)
  abierto = signal(false)
  items = computed(() => MENU[this.auth.rol() ?? ''] ?? [])
  rolTexto = computed(() => ({ ADMIN: 'Administrador', TUTOR: 'Tutor', ESTUDIANTE: 'Estudiante' } as any)[this.auth.rol() ?? ''] ?? '')

  salir() {
    this.auth.logout()
    this.router.navigate(['/login'])
  }
}
