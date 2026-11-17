import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Disponibilidadhorariaservice } from '../../../services/disponibilidadhorariaservice';
import { Toastservice } from '../../../core/toastservice';
import { Loginservice } from '../../../core/loginservice';
import { DisponibilidadHorariaDTO } from '../../../models/DisponibilidadHorariaDTO';
import { DIAS } from '../../../models/Constantes';
import { aLocalTime, hhmm, minutos, mismoDia } from '../../../core/fechas';

@Component({
  selector: 'app-dinsert',
  imports: [FormsModule, RouterLink],
  templateUrl: './dinsertcomponent.html',
})
export class Dinsertcomponent implements OnInit {
  private dS = inject(Datosservice)
  private dispS = inject(Disponibilidadhorariaservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private auth = inject(Loginservice)
  x = new DisponibilidadHorariaDTO()
  d = new Datos()
  dias = DIAS
  id = 0
  esTutor = this.auth.rol() === 'TUTOR'
  base = this.esTutor ? '/tutor/disponibilidad' : '/admin/disponibilidades'
  error = ''

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
    if (this.esTutor) this.x.idTutor = this.auth.id()
    this.dS.cargar(['usuarios', 'tutores', 'disponibilidades']).subscribe(d => {
      this.d = d
      if (this.id) {
        const a = d.disponibilidades.find(z => z.idDisponibilidad === this.id)
        if (a) this.x = { ...a, horaInicio: hhmm(a.horaInicio), horaFin: hhmm(a.horaFin) }
      }
    })
  }

  aceptar() {
    this.error = ''
    const x = this.x
    if (!x.idTutor || !x.diaSemana || !x.horaInicio || !x.horaFin) { this.error = 'Completa todos los campos'; return }
    if (minutos(x.horaFin) <= minutos(x.horaInicio)) { this.error = 'La hora de fin debe ser mayor a la de inicio'; return }
    const cruce = this.d.disponibilidades.some(o => o.idTutor === x.idTutor && o.idDisponibilidad !== this.id
      && mismoDia(o.diaSemana, x.diaSemana)
      && minutos(x.horaInicio) < minutos(o.horaFin) && minutos(o.horaInicio) < minutos(x.horaFin))
    if (cruce) { this.error = 'Ese bloque se cruza con otro bloque del mismo día'; return }

    const body = { ...x, horaInicio: aLocalTime(x.horaInicio), horaFin: aLocalTime(x.horaFin) }
    const p = this.id ? this.dispS.update(this.id, body) : this.dispS.insert(body)
    p.subscribe({
      next: () => { this.toast.ok('Disponibilidad guardada'); this.router.navigate([this.base]) },
      error: e => this.error = e.error?.error ?? 'Error al guardar',
    })
  }
}
