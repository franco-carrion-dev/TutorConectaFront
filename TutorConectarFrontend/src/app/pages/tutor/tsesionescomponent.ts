import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { Toastservice } from '../../core/toastservice';
import { Sesionservice } from '../../services/sesionservice';
import { Reporteprogresoservice } from '../../services/reporteprogresoservice';
import { SesionDTO } from '../../models/SesionDTO';
import { ReporteProgresoDTO } from '../../models/ReporteProgresoDTO';
import { EtiquetaPipe } from '../../shared/pipes';
import { ahora } from '../../core/fechas';

@Component({
  selector: 'app-tsesiones',
  imports: [RouterLink, DatePipe, EtiquetaPipe],
  templateUrl: './tsesionescomponent.html',
})
export class Tsesionescomponent implements OnInit {
  private dS = inject(Datosservice)
  private sS = inject(Sesionservice)
  private rS = inject(Reporteprogresoservice)
  private toast = inject(Toastservice)
  private auth = inject(Loginservice)
  d = new Datos()
  reportes: ReporteProgresoDTO[] = []
  tab: 'proximas' | 'pendientes' | 'historial' = 'proximas'
  mias: SesionDTO[] = []
  cargando = true

  ngOnInit() { this.cargar() }
  cargar() {
    forkJoin({
      d: this.dS.cargar(['sesiones', 'usuarios', 'materias', 'pagos']),
      rep: this.rS.listByTutor(this.auth.id()),
    }).subscribe(({ d, rep }) => {
      this.d = d
      this.reportes = rep
      this.mias = d.sesiones.filter(s => s.idTutor === this.auth.id())
      this.cargando = false
    })
  }

  get lista() {
    const now = ahora().substring(0, 16)
    if (this.tab === 'proximas') return this.mias.filter(s => (s.estado === 'agendada' || s.estado === 'pendiente_pago') && s.fechaFin >= now)
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
    if (this.tab === 'pendientes') return this.mias.filter(s => s.estado === 'agendada' && s.fechaFin < now)
    return this.mias.filter(s => s.estado === 'realizada' || s.estado === 'cancelada').sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))
  }
  tieneReporte(s: SesionDTO) { return this.reportes.some(r => r.idSesion === s.idSesion) }
  puedeUnirse(s: SesionDTO) {
    const ini = new Date(s.fechaInicio).getTime(), fin = new Date(s.fechaFin).getTime(), now = Date.now()
    return s.estado === 'agendada' && now >= ini - 15 * 60000 && now <= fin
  }

  estado(s: SesionDTO, estado: 'realizada' | 'cancelada') {
    if (estado === 'cancelada' && !confirm('¿Cancelar esta sesión? Si estaba pagada, el estudiante podrá pedir reembolso.')) return
    this.sS.cambiarEstado(s.idSesion, estado).subscribe({
      next: () => { s.estado = estado; this.toast.ok(estado === 'realizada' ? 'Sesión marcada como realizada. Registra el reporte de progreso.' : 'Sesión cancelada') },
      error: e => this.toast.http(e),
    })
  }
}
