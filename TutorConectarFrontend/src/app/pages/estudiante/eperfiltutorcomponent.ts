import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { Toastservice } from '../../core/toastservice';
import { Jitsiservice } from '../../core/jitsiservice';
import { Sesionservice } from '../../services/sesionservice';
import { TutorDTO } from '../../models/TutorDTO';
import { SesionDTO } from '../../models/SesionDTO';
import { DIAS } from '../../models/Constantes';
import { aLocalDateTime, ahora, diaDe, hhmm, minutos, mismoDia } from '../../core/fechas';
import { EstrellasPipe, InicialesPipe } from '../../shared/pipes';

/** Perfil público del tutor + agendar sesión con confirmación automática de disponibilidad */
@Component({
  selector: 'app-eperfiltutor',
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe, EstrellasPipe, InicialesPipe],
  templateUrl: './eperfiltutorcomponent.html',
})
export class Eperfiltutorcomponent implements OnInit {
  private dS = inject(Datosservice)
  private sS = inject(Sesionservice)
  private jitsi = inject(Jitsiservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private auth = inject(Loginservice)
  d = new Datos()
  t: TutorDTO | undefined
  id = 0
  dias = DIAS
  hhmm = hhmm
  cargando = true
  esEstudiante = false

  // formulario de agenda
  idMateria: number | null = null
  fecha = ''
  hora = ''
  duracion = 60
  slots: string[] = []
  error = ''
  guardando = false
  hoy = ahora().substring(0, 10)

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'))
    this.cargar()
  }

  cargar() {
    this.dS.cargar(['tutores', 'usuarios', 'materias', 'disponibilidades', 'calificaciones', 'sesiones', 'estudiantes']).subscribe(d => {
      this.d = d
      this.t = d.tutor(this.id)
      this.esEstudiante = d.estudiantes.some(e => e.idEstudiante === this.auth.id())
      if (this.t?.idMaterias?.length === 1) this.idMateria = this.t.idMaterias[0]
      this.cargando = false
      this.calcularSlots()
    })
  }

  get nombre() { return this.d.nombre(this.t?.idUsuario) }
  get rating() { return this.d.promedio(this.id) }
  get resenas() {
    return this.d.calificaciones.filter(c => c.idTutor === this.id)
      .sort((a, b) => (b.fechaCalificacion ?? '').localeCompare(a.fechaCalificacion ?? '')).slice(0, 8)
  }
  get realizadas() { return this.d.sesiones.filter(s => s.idTutor === this.id && s.estado === 'realizada').length }
  bloques(dia: string) {
    return this.d.disponibilidades.filter(x => x.idTutor === this.id && x.disponible && mismoDia(x.diaSemana, dia))
      .sort((a, b) => minutos(a.horaInicio) - minutos(b.horaInicio))
  }
  get costo() { return Math.round(Number(this.t?.tarifaPorHora ?? 0) * (this.duracion / 60) * 100) / 100 }

  /** Horarios libres: dentro de la disponibilidad del día y sin cruce con otras sesiones del tutor */
  calcularSlots() {
    this.slots = []
    this.hora = ''
    if (!this.fecha || !this.t) return
    const f = new Date(this.fecha + 'T00:00:00')
    const ocupadas = this.ocupadas(this.d.sesiones, this.fecha)
    const ahoraMin = this.fecha === this.hoy ? new Date().getHours() * 60 + new Date().getMinutes() + 60 : -1
    for (const b of this.bloques(diaDe(f))) {
      for (let m = minutos(b.horaInicio); m + this.duracion <= minutos(b.horaFin); m += 30) {
        const fin = m + this.duracion
        if (m < ahoraMin) continue
        if (ocupadas.some(([a, z]) => m < z && a < fin)) continue
        const h = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
        if (!this.slots.includes(h)) this.slots.push(h)
      }
    }
  }

  private ocupadas(sesiones: SesionDTO[], fecha: string): [number, number][] {
    return sesiones.filter(s => s.idTutor === this.id && (s.estado === 'agendada' || s.estado === 'pendiente_pago')
        && s.fechaInicio.substring(0, 10) === fecha)
      .map(s => [minutos(s.fechaInicio.substring(11, 16)), minutos(s.fechaFin.substring(11, 16))])
  }

  agendar() {
    this.error = ''
    if (!this.esEstudiante) { this.error = 'Completa tu perfil de estudiante antes de agendar'; return }
    if (!this.idMateria || !this.fecha || !this.hora) { this.error = 'Elige materia, fecha y hora'; return }
    const [h, m] = this.hora.split(':').map(Number)
    const ini = new Date(this.fecha + 'T00:00:00'); ini.setHours(h, m, 0, 0)
    const fin = new Date(ini.getTime() + this.duracion * 60000)
    this.guardando = true
    // Confirmación automática: volvemos a leer las sesiones para evitar choques de último momento
    this.sS.list().subscribe({
      next: actuales => {
        const ini0 = h * 60 + m, fin0 = ini0 + this.duracion
        if (this.ocupadas(actuales, this.fecha).some(([a, z]) => ini0 < z && a < fin0)) {
          this.guardando = false
          this.error = 'Ese horario acaba de ser tomado. Elige otro.'
          this.d.sesiones = actuales; this.calcularSlots()
          return
        }
        const s: SesionDTO = {
          idSesion: 0, idEstudiante: this.auth.id(), idTutor: this.id, idMateria: this.idMateria!,
          fechaInicio: aLocalDateTime(ini), fechaFin: aLocalDateTime(fin), estado: 'pendiente_pago',
          enlaceJitsi: this.jitsi.nuevoEnlace(), fechaCreacion: ahora(),
        }
        this.sS.insert(s).subscribe({
          next: creada => {
            this.toast.ok('Horario reservado. Completa el pago para confirmar la sesión.')
            this.router.navigate(['/estudiante/pago', creada.idSesion])
          },
          error: e => { this.guardando = false; this.error = e.error?.error ?? 'No se pudo agendar' },
        })
      },
      error: e => { this.guardando = false; this.toast.http(e) },
    })
  }
}
