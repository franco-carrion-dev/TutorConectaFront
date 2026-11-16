import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Calificacionservice } from '../../../services/calificacionservice';
import { Promedioservice } from '../../../core/promedioservice';
import { Toastservice } from '../../../core/toastservice';
import { CalificacionDTO } from '../../../models/CalificacionDTO';
import { ahora } from '../../../core/fechas';

@Component({
  selector: 'app-cinsert',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './cinsertcomponent.html',
})
export class Cinsertcomponent implements OnInit {
  private dS = inject(Datosservice)
  private cS = inject(Calificacionservice)
  private prom = inject(Promedioservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  c = new CalificacionDTO()
  d = new Datos()
  id = 0
  error = ''

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
    this.dS.cargar(['calificaciones', 'sesiones', 'usuarios', 'materias']).subscribe(d => {
      this.d = d
      const a = d.calificaciones.find(x => x.idCalificacion === this.id)
      if (a) this.c = { ...a }
    })
  }
  sesionesRealizadas() { return this.d.sesiones.filter(s => s.estado === 'realizada' || s.idSesion === this.c.idSesion) }
  alElegir() { this.c.idTutor = this.d.sesion(this.c.idSesion)?.idTutor ?? 0 }

  aceptar() {
    this.error = ''
    if (!this.c.idSesion || !this.c.idTutor) { this.error = 'Selecciona la sesión'; return }
    if (this.c.puntuacion < 1 || this.c.puntuacion > 5) { this.error = 'La puntuación va de 1 a 5'; return }
    const body = { ...this.c, fechaCalificacion: this.c.fechaCalificacion || ahora() }
    const obs = this.id ? this.cS.update(this.id, body) : this.cS.insert(body)
    obs.pipe(switchMap(() => this.prom.recalcular(this.c.idTutor))).subscribe({
      next: () => { this.toast.ok('Calificación guardada'); this.router.navigate(['/admin/calificaciones']) },
      error: e => this.error = e.error?.error ?? 'Error al guardar',
    })
  }
}
