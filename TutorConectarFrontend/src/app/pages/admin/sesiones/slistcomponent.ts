import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Sesionservice } from '../../../services/sesionservice';
import { Toastservice } from '../../../core/toastservice';
import { SesionDTO } from '../../../models/SesionDTO';
import { ESTADOS_SESION } from '../../../models/Constantes';
import { EtiquetaPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-slist',
  imports: [FormsModule, RouterLink, DatePipe, EtiquetaPipe],
  templateUrl: './slistcomponent.html',
})
export class Slistcomponent implements OnInit {
  private dS = inject(Datosservice)
  private sS = inject(Sesionservice)
  private toast = inject(Toastservice)
  d = new Datos()
  lista: SesionDTO[] = []
  estados = ESTADOS_SESION
  estado = ''
  idTutor: number | null = null
  idMateria: number | null = null
  desde = ''
  hasta = ''
  cargando = true

  ngOnInit() { this.cargar() }
  cargar() {
    this.dS.cargar(['sesiones', 'usuarios', 'tutores', 'materias', 'pagos']).subscribe(d => { this.d = d; this.cargando = false; this.filtrar() })
  }
  filtrar() {
    this.lista = this.d.sesiones.filter(s =>
      (!this.estado || s.estado === this.estado) &&
      (!this.idTutor || s.idTutor === this.idTutor) &&
      (!this.idMateria || s.idMateria === this.idMateria) &&
      (!this.desde || s.fechaInicio >= this.desde) &&
      (!this.hasta || s.fechaInicio.substring(0, 10) <= this.hasta)
    ).sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))
  }
  cambiarEstado(s: SesionDTO, estado: string) {
    this.sS.cambiarEstado(s.idSesion, estado).subscribe({
      next: () => { s.estado = estado; this.toast.ok('Estado actualizado') },
      error: e => this.toast.http(e),
    })
  }
  eliminar(s: SesionDTO) {
    if (!confirm(`¿Eliminar la sesión #${s.idSesion}?`)) return
    this.sS.delete(s.idSesion).subscribe({
      next: () => { this.toast.ok('Sesión eliminada'); this.cargar() },
      error: e => this.toast.http(e, 'No se pudo eliminar: tiene pagos, calificaciones o reportes'),
    })
  }
}
