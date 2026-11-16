import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Calificacionservice } from '../../../services/calificacionservice';
import { Promedioservice } from '../../../core/promedioservice';
import { Toastservice } from '../../../core/toastservice';
import { CalificacionDTO } from '../../../models/CalificacionDTO';
import { EstrellasPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-clist',
  imports: [FormsModule, RouterLink, DatePipe, EstrellasPipe],
  templateUrl: './clistcomponent.html',
})
export class Clistcomponent implements OnInit {
  private dS = inject(Datosservice)
  private cS = inject(Calificacionservice)
  private prom = inject(Promedioservice)
  private toast = inject(Toastservice)
  d = new Datos()
  lista: CalificacionDTO[] = []
  idTutor: number | null = null
  minimo = 0
  cargando = true

  ngOnInit() { this.cargar() }
  cargar() {
    this.dS.cargar(['calificaciones', 'usuarios', 'tutores', 'sesiones', 'materias']).subscribe(d => { this.d = d; this.cargando = false; this.filtrar() })
  }
  filtrar() {
    this.lista = this.d.calificaciones
      .filter(c => (!this.idTutor || c.idTutor === this.idTutor) && c.puntuacion >= this.minimo)
      .sort((a, b) => (b.fechaCalificacion ?? '').localeCompare(a.fechaCalificacion ?? ''))
  }
  eliminar(c: CalificacionDTO) {
    if (!confirm(`¿Eliminar la calificación #${c.idCalificacion}?`)) return
    this.cS.delete(c.idCalificacion).pipe(switchMap(() => this.prom.recalcular(c.idTutor))).subscribe({
      next: () => { this.toast.ok('Calificación eliminada'); this.cargar() },
      error: e => this.toast.http(e),
    })
  }
}
