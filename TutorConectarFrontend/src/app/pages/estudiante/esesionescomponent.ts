import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { concat, forkJoin, of, switchMap, toArray } from 'rxjs';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { Toastservice } from '../../core/toastservice';
import { Promedioservice } from '../../core/promedioservice';
import { Sesionservice } from '../../services/sesionservice';
import { Pagoservice } from '../../services/pagoservice';
import { Calificacionservice } from '../../services/calificacionservice';
import { Reporteprogresoservice } from '../../services/reporteprogresoservice';
import { SesionDTO } from '../../models/SesionDTO';
import { CalificacionDTO } from '../../models/CalificacionDTO';
import { ReporteProgresoDTO } from '../../models/ReporteProgresoDTO';
import { EtiquetaPipe } from '../../shared/pipes';
import { ahora } from '../../core/fechas';

@Component({
  selector: 'app-esesiones',
  imports: [FormsModule, RouterLink, DatePipe, EtiquetaPipe],
  templateUrl: './esesionescomponent.html',
})
export class Esesionescomponent implements OnInit {
  private dS = inject(Datosservice)
  private sS = inject(Sesionservice)
  private pS = inject(Pagoservice)
  private cS = inject(Calificacionservice)
  private rS = inject(Reporteprogresoservice)
  private prom = inject(Promedioservice)
  private toast = inject(Toastservice)
  private auth = inject(Loginservice)
  d = new Datos()
  tab: 'proximas' | 'historial' = 'proximas'
  proximas: SesionDTO[] = []
  historial: SesionDTO[] = []
  reportes: ReporteProgresoDTO[] = []
  cargando = true
  // modal calificar
  calificando: SesionDTO | null = null
  cal = new CalificacionDTO()
  // modal reporte
  viendo: SesionDTO | null = null

  ngOnInit() { this.cargar() }

  cargar() {
    forkJoin({
      d: this.dS.cargar(['sesiones', 'usuarios', 'materias', 'pagos', 'calificaciones', 'tutores']),
      rep: this.rS.listByEstudiante(this.auth.id()),
    }).subscribe(({ d, rep }) => {
      this.d = d
      this.reportes = rep
      const mias = d.sesiones.filter(s => s.idEstudiante === this.auth.id())
      const now = ahora().substring(0, 16)
      this.proximas = mias.filter(s => (s.estado === 'agendada' || s.estado === 'pendiente_pago') && s.fechaFin >= now)
        .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
      this.historial = mias.filter(s => !this.proximas.includes(s)).sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))
      this.cargando = false
    })
  }

  get lista() { return this.tab === 'proximas' ? this.proximas : this.historial }
  reportesDe(s: SesionDTO) { return this.reportes.filter(r => r.idSesion === s.idSesion) }
  puedeUnirse(s: SesionDTO) {
    const ini = new Date(s.fechaInicio).getTime(), fin = new Date(s.fechaFin).getTime(), now = Date.now()
    return s.estado === 'agendada' && now >= ini - 15 * 60000 && now <= fin
  }

  /** Cancela la sesión; si ya estaba pagada, abre una solicitud de reembolso (pago EN_DISPUTA) */
  cancelar(s: SesionDTO) {
    const pagos = this.d.pagosDeSesion(s.idSesion).filter(p => p.estado === 'COMPLETADO')
    const msg = pagos.length ? '¿Cancelar la sesión? Se enviará una solicitud de reembolso al administrador.' : '¿Cancelar la sesión?'
    if (!confirm(msg)) return
    this.sS.cambiarEstado(s.idSesion, 'cancelada').pipe(
      switchMap(() => pagos.length ? concat(...pagos.map(p => this.pS.update(p.idPago, { ...p, estado: 'EN_DISPUTA' }))).pipe(toArray()) : of([]))
    ).subscribe({
      next: () => { this.toast.ok(pagos.length ? 'Sesión cancelada. Reembolso solicitado.' : 'Sesión cancelada'); this.cargar() },
      error: e => this.toast.http(e),
    })
  }

  abrirCalificar(s: SesionDTO) {
    this.calificando = s
    this.cal = { ...new CalificacionDTO(), idSesion: s.idSesion, idTutor: s.idTutor, puntuacion: 5 }
  }

  enviarCalificacion() {
    const s = this.calificando!
    const body = { ...this.cal, fechaCalificacion: ahora() }
    this.cS.insert(body).pipe(switchMap(() => this.prom.recalcular(s.idTutor))).subscribe({
      next: () => {
        this.toast.ok('¡Gracias! Tu calificación mejora las recomendaciones.')
        this.calificando = null
        this.cargar()
      },
      error: e => this.toast.http(e),
    })
  }
}
