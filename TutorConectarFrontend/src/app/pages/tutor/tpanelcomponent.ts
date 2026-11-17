import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { Pagoservice } from '../../services/pagoservice';
import { SesionDTO } from '../../models/SesionDTO';
import { CalificacionDTO } from '../../models/CalificacionDTO';
import { EtiquetaPipe, EstrellasPipe } from '../../shared/pipes';
import { ahora } from '../../core/fechas';

@Component({
  selector: 'app-tpanel',
  imports: [RouterLink, DatePipe, CurrencyPipe, DecimalPipe, EtiquetaPipe, EstrellasPipe],
  templateUrl: './tpanelcomponent.html',
})
export class Tpanelcomponent implements OnInit {
  private dS = inject(Datosservice)
  private pS = inject(Pagoservice)
  auth = inject(Loginservice)
  d = new Datos()
  cargando = true
  sinPerfil = false
  verificado = false
  sinMaterias = false
  sinDisponibilidad = false
  proximas: SesionDTO[] = []
  porReportar: SesionDTO[] = []
  resenas: CalificacionDTO[] = []
  kpi = { proximas: 0, realizadas: 0, ingresos: 0, rating: 0, n: 0, cancelacion: 0 }

  ngOnInit() {
    const id = this.auth.id()
    forkJoin({
      d: this.dS.cargar(['sesiones', 'usuarios', 'tutores', 'materias', 'calificaciones', 'disponibilidades']),
      // Query del backend: pagos de un tutor filtrados por estado
      pagos: this.pS.listByTutorYEstado(id, 'COMPLETADO'),
    }).subscribe(({ d, pagos }) => {
      this.d = d
      const t = d.tutor(id)
      this.sinPerfil = !t
      this.verificado = !!t?.verificado
      this.sinMaterias = !t?.idMaterias?.length
      this.sinDisponibilidad = !d.disponibilidades.some(x => x.idTutor === id)
      const mias = d.sesiones.filter(s => s.idTutor === id)
      const now = ahora().substring(0, 16)
      this.proximas = mias.filter(s => s.estado === 'agendada' && s.fechaFin >= now).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
      this.porReportar = mias.filter(s => s.estado === 'agendada' && s.fechaFin < now)
      const p = d.promedio(id)
      const canceladas = mias.filter(s => s.estado === 'cancelada').length
      this.kpi = {
        proximas: this.proximas.length,
        realizadas: mias.filter(s => s.estado === 'realizada').length,
        ingresos: pagos.reduce((a, x) => a + Number(x.monto), 0),
        rating: p.prom, n: p.n,
        cancelacion: mias.length ? canceladas / mias.length : 0,
      }
      this.resenas = d.calificaciones.filter(c => c.idTutor === id)
        .sort((a, b) => (b.fechaCalificacion ?? '').localeCompare(a.fechaCalificacion ?? '')).slice(0, 5)
      this.cargando = false
    })
  }

  puedeUnirse(s: SesionDTO) {
    const ini = new Date(s.fechaInicio).getTime(), fin = new Date(s.fechaFin).getTime(), now = Date.now()
    return now >= ini - 15 * 60000 && now <= fin
  }
}
