import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Disponibilidadhorariaservice } from '../../../services/disponibilidadhorariaservice';
import { Toastservice } from '../../../core/toastservice';
import { Loginservice } from '../../../core/loginservice';
import { DisponibilidadHorariaDTO } from '../../../models/DisponibilidadHorariaDTO';
import { DIAS } from '../../../models/Constantes';
import { hhmm, minutos, normalizar } from '../../../core/fechas';

/** Disponibilidad horaria. Admin: todas. Tutor: solo las suyas (vista semanal) */
@Component({
  selector: 'app-dlist',
  imports: [FormsModule, RouterLink],
  templateUrl: './dlistcomponent.html',
  styleUrl: './dlistcomponent.css',
})
export class Dlistcomponent implements OnInit {
  private dS = inject(Datosservice)
  private dispS = inject(Disponibilidadhorariaservice)
  private toast = inject(Toastservice)
  private auth = inject(Loginservice)
  d = new Datos()
  lista: DisponibilidadHorariaDTO[] = []
  dias = DIAS
  esTutor = this.auth.rol() === 'TUTOR'
  base = this.esTutor ? '/tutor/disponibilidad' : '/admin/disponibilidades'
  idTutor: number | null = null
  dia = ''
  cargando = true
  hhmm = hhmm

  ngOnInit() {
    this.dS.cargar(['usuarios', 'tutores']).subscribe(d => { this.d = d; this.buscar() })
  }

  /** Usa los endpoints del backend: /tutor/{id} y /dia/{dia} */
  buscar() {
    this.cargando = true
    const obs = this.esTutor ? this.dispS.listByTutor(this.auth.id())
      : this.idTutor ? this.dispS.listByTutor(this.idTutor)
      : this.dia ? this.dispS.listByDia(this.dia)
      : this.dispS.list()
    obs.subscribe({
      next: r => {
        let l = r
        if (!this.esTutor && this.idTutor && this.dia) l = l.filter(x => normalizar(x.diaSemana) === normalizar(this.dia))
        this.lista = l.sort((a, b) => this.ordenDia(a.diaSemana) - this.ordenDia(b.diaSemana) || minutos(a.horaInicio) - minutos(b.horaInicio))
        this.cargando = false
      },
      error: e => { this.cargando = false; this.toast.http(e) },
    })
  }

  delDia(dia: string) { return this.lista.filter(x => normalizar(x.diaSemana) === normalizar(dia)) }
  ordenDia(d: string) { const i = DIAS.findIndex(x => normalizar(x) === normalizar(d)); return i < 0 ? 9 : i }
  nombreTutor(x: DisponibilidadHorariaDTO) { return x.nombreTutor || this.d.nombre(x.idTutor) }

  alternar(x: DisponibilidadHorariaDTO) {
    const body = { ...x, disponible: !x.disponible }
    this.dispS.update(x.idDisponibilidad, body).subscribe({
      next: () => { x.disponible = !x.disponible },
      error: e => this.toast.http(e),
    })
  }
  eliminar(x: DisponibilidadHorariaDTO) {
    if (!confirm(`¿Eliminar el bloque ${x.diaSemana} ${hhmm(x.horaInicio)}-${hhmm(x.horaFin)}?`)) return
    this.dispS.delete(x.idDisponibilidad).subscribe({
      next: () => { this.toast.ok('Bloque eliminado'); this.buscar() },
      error: e => this.toast.http(e),
    })
  }
}
