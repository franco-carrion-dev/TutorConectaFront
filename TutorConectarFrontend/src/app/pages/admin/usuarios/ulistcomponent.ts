import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Toastservice } from '../../../core/toastservice';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { normalizar } from '../../../core/fechas';

@Component({
  selector: 'app-ulist',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './ulistcomponent.html',
})
export class Ulistcomponent implements OnInit {
  private dS = inject(Datosservice)
  private uS = inject(Usuarioservice)
  private toast = inject(Toastservice)
  d = new Datos()
  lista: UsuarioDTO[] = []
  texto = ''
  idRol: number | null = null
  cargando = true

  ngOnInit() { this.cargar() }

  cargar() {
    this.cargando = true
    this.dS.cargar(['usuarios', 'roles']).subscribe(d => { this.d = d; this.cargando = false; this.filtrar() })
  }

  filtrar() {
    const t = normalizar(this.texto)
    this.lista = this.d.usuarios.filter(u =>
      (!t || normalizar(`${u.nombre} ${u.apellido} ${u.email}`).includes(t)) &&
      (!this.idRol || u.idRol === this.idRol))
  }

  /** Query del backend: GET /api/usuarios/tutores/buscar?nombre= */
  buscarTutores() {
    if (!this.texto) { this.toast.info('Escribe un nombre para buscar tutores'); return }
    this.uS.buscarTutoresPorNombre(this.texto).subscribe({
      next: r => { this.lista = r; if (!r.length) this.toast.info('No se encontraron tutores con ese nombre') },
      error: e => this.toast.http(e),
    })
  }

  cambiarActivo(u: UsuarioDTO) {
    const body = { ...u, activo: !u.activo, passwordHash: '' }
    this.uS.update(u.idUsuario, body).subscribe({
      next: () => { u.activo = !u.activo; this.toast.ok(u.activo ? 'Usuario activado' : 'Usuario desactivado') },
      error: e => this.toast.http(e),
    })
  }

  eliminar(u: UsuarioDTO) {
    if (!confirm(`¿Eliminar a ${u.nombre} ${u.apellido}?`)) return
    this.uS.delete(u.idUsuario).subscribe({
      next: () => { this.toast.ok('Usuario eliminado'); this.cargar() },
      error: e => this.toast.http(e, 'No se pudo eliminar (puede tener perfil de tutor/estudiante o sesiones)'),
    })
  }
}
