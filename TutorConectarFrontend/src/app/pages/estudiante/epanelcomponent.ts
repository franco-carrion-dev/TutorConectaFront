import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { Reporteprogresoservice } from '../../services/reporteprogresoservice';
import { Recomendacion, Recomendadorservice } from '../../core/recomendadorservice';
import { ReporteProgresoDTO } from '../../models/ReporteProgresoDTO';
import { SesionDTO } from '../../models/SesionDTO';
import { PROGRESOS } from '../../models/Constantes';
import { EtiquetaPipe, InicialesPipe } from '../../shared/pipes';
import { ahora as ahoraLocal } from '../../core/fechas';

interface ProgresoMateria { materia: string; pct: number; nivel: string; sesiones: number; ultima: string; obs: string }

@Component({
  selector: 'app-epanel',
  imports: [RouterLink, DatePipe, CurrencyPipe, DecimalPipe, EtiquetaPipe, InicialesPipe],
  templateUrl: './epanelcomponent.html',
})
export class Epanelcomponent implements OnInit {
  private dS = inject(Datosservice)
  private rS = inject(Reporteprogresoservice)
  private rec = inject(Recomendadorservice)
  auth = inject(Loginservice)
  d = new Datos()
  cargando = true
  sinPerfil = false
  presupuesto: number | null = null
  proximas: SesionDTO[] = []
  historial: SesionDTO[] = []
  progreso: ProgresoMateria[] = []
  recomendados: Recomendacion[] = []
  kpi = { proximas: 0, realizadas: 0, horas: 0, gasto: 0 }

  ngOnInit() {
    const id = this.auth.id()
    forkJoin({
      d: this.dS.cargar(['sesiones', 'usuarios', 'tutores', 'estudiantes', 'materias', 'pagos', 'calificaciones', 'disponibilidades']),
      rep: this.rS.listByEstudiante(id),
    }).subscribe(({ d, rep }) => {
      this.d = d
      const est = d.estudiantes.find(e => e.idEstudiante === id)
      this.sinPerfil = !est
      this.presupuesto = est?.presupuestoMaximo ?? null
      const mias = d.sesiones.filter(s => s.idEstudiante === id)
      const ahora = ahoraLocal().substring(0, 16)
      this.proximas = mias.filter(s => (s.estado === 'agendada' || s.estado === 'pendiente_pago') && s.fechaFin >= ahora)
        .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
      this.historial = mias.filter(s => s.estado === 'realizada' || s.estado === 'cancelada')
        .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)).slice(0, 6)
      const realizadas = mias.filter(s => s.estado === 'realizada')
      const idsMias = new Set(mias.map(s => s.idSesion))
      this.kpi = {
        proximas: this.proximas.length,
        realizadas: realizadas.length,
        horas: realizadas.reduce((a, s) => a + d.horas(s), 0),
        gasto: d.pagos.filter(p => idsMias.has(p.idSesion) && p.estado === 'COMPLETADO').reduce((a, p) => a + Number(p.monto), 0),
      }
      this.progreso = this.calcularProgreso(rep, realizadas)
      // Recomendación IA: materia de su última sesión + presupuesto declarado
      const ultimaMateria = mias.sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))[0]?.idMateria ?? null
      this.recomendados = this.rec.recomendar(d, { idMateria: ultimaMateria, dia: null, hora: null, presupuesto: this.presupuesto, idEstudiante: id }, 3)
      if (!this.recomendados.length && ultimaMateria)
        this.recomendados = this.rec.recomendar(d, { idMateria: null, dia: null, hora: null, presupuesto: this.presupuesto, idEstudiante: id }, 3)
      this.cargando = false
    })
  }

  /** Progreso por materia: último nivel reportado por el tutor + sesiones realizadas */
  private calcularProgreso(rep: ReporteProgresoDTO[], realizadas: SesionDTO[]): ProgresoMateria[] {
    const porMateria = new Map<number, ProgresoMateria>()
    realizadas.forEach(s => {
      const p = porMateria.get(s.idMateria) ?? { materia: this.d.nombreMateria(s.idMateria), pct: 0, nivel: 'Sin reporte', sesiones: 0, ultima: '', obs: '' }
      p.sesiones++
      porMateria.set(s.idMateria, p)
    })
    rep.slice().sort((a, b) => a.fechaReporte.localeCompare(b.fechaReporte)).forEach(r => {
      const s = this.d.sesion(r.idSesion)
      if (!s) return
      const p = porMateria.get(s.idMateria) ?? { materia: this.d.nombreMateria(s.idMateria), pct: 0, nivel: '', sesiones: 0, ultima: '', obs: '' }
      p.nivel = r.progreso; p.pct = PROGRESOS[r.progreso] ?? 50; p.ultima = r.fechaReporte; p.obs = r.observaciones
      porMateria.set(s.idMateria, p)
    })
    return [...porMateria.values()].sort((a, b) => b.pct - a.pct)
  }

  puedeUnirse(s: SesionDTO) {
    const ini = new Date(s.fechaInicio).getTime(), fin = new Date(s.fechaFin).getTime(), now = Date.now()
    return s.estado === 'agendada' && now >= ini - 15 * 60000 && now <= fin
  }
}
