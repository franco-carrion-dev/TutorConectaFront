import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../core/datosservice';
import { EstrellasPipe } from '../../shared/pipes';

interface Barra { nombre: string; valor: number; pct: number; extra?: string }
interface Mes { mes: string; agendada: number; realizada: number; cancelada: number; pendiente_pago: number; total: number }

/** Reportes y dashboards de la propuesta (sección 10) */
@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink, CurrencyPipe, DecimalPipe, PercentPipe, EstrellasPipe],
  templateUrl: './dashboardcomponent.html',
})
export class Dashboardcomponent implements OnInit {
  private dS = inject(Datosservice)
  d = new Datos()
  cargando = true
  desde = ''
  hasta = ''

  kpi = { sesiones: 0, realizadas: 0, canceladas: 0, agendadas: 0, ingresos: 0, tutores: 0, pendientes: 0, estudiantes: 0, disputas: 0 }
  meses: Mes[] = []
  maxMes = 1
  ingresosTutor: Barra[] = []
  ingresosMateria: Barra[] = []
  demanda: Barra[] = []
  cancelacion: Barra[] = []
  ranking: { nombre: string; prom: number; n: number; tarifa: number }[] = []

  ngOnInit() {
    const hoy = new Date()
    const ini = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1)
    this.desde = ini.toISOString().substring(0, 10)
    this.hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0).toISOString().substring(0, 10)
    this.dS.cargar(['sesiones', 'pagos', 'calificaciones', 'tutores', 'estudiantes', 'usuarios', 'materias'])
      .subscribe(d => { this.d = d; this.cargando = false; this.calcular() })
  }

  periodo(dias: number | null) {
    const hoy = new Date()
    if (dias === null) { this.desde = ''; this.hasta = '' }
    else { this.desde = new Date(hoy.getTime() - dias * 86400000).toISOString().substring(0, 10); this.hasta = hoy.toISOString().substring(0, 10) }
    this.calcular()
  }

  private enPeriodo(f: string | null | undefined) {
    if (!f) return !this.desde && !this.hasta
    const x = f.substring(0, 10)
    return (!this.desde || x >= this.desde) && (!this.hasta || x <= this.hasta)
  }

  calcular() {
    const d = this.d
    const ses = d.sesiones.filter(s => this.enPeriodo(s.fechaInicio))
    const idsSes = new Set(ses.map(s => s.idSesion))
    const pagosOk = d.pagos.filter(p => p.estado === 'COMPLETADO' && idsSes.has(p.idSesion))

    this.kpi = {
      sesiones: ses.length,
      realizadas: ses.filter(s => s.estado === 'realizada').length,
      canceladas: ses.filter(s => s.estado === 'cancelada').length,
      agendadas: ses.filter(s => s.estado === 'agendada').length,
      ingresos: pagosOk.reduce((a, p) => a + Number(p.monto), 0),
      tutores: d.tutores.filter(t => t.verificado).length,
      pendientes: d.tutores.filter(t => !t.verificado).length,
      estudiantes: d.estudiantes.length,
      disputas: d.pagos.filter(p => p.estado === 'EN_DISPUTA').length,
    }

    // 1) Sesiones agendadas, realizadas y canceladas por periodo (mes)
    const porMes = new Map<string, Mes>()
    ses.forEach(s => {
      const k = s.fechaInicio.substring(0, 7)
      const m = porMes.get(k) ?? { mes: k, agendada: 0, realizada: 0, cancelada: 0, pendiente_pago: 0, total: 0 }
      if (s.estado in m) (m as any)[s.estado]++
      m.total++
      porMes.set(k, m)
    })
    this.meses = [...porMes.values()].sort((a, b) => a.mes.localeCompare(b.mes))
    this.maxMes = Math.max(1, ...this.meses.map(m => m.total))

    // 2) Ingresos por tutor y por materia
    const porTutor = new Map<number, number>(), porMateria = new Map<number, number>()
    pagosOk.forEach(p => {
      const s = d.sesion(p.idSesion)
      if (!s) return
      porTutor.set(s.idTutor, (porTutor.get(s.idTutor) ?? 0) + Number(p.monto))
      porMateria.set(s.idMateria, (porMateria.get(s.idMateria) ?? 0) + Number(p.monto))
    })
    this.ingresosTutor = this.barras([...porTutor].map(([id, v]) => ({ nombre: d.nombre(id), valor: v })))
    this.ingresosMateria = this.barras([...porMateria].map(([id, v]) => ({ nombre: d.nombreMateria(id), valor: v })))

    // 3) Materias con mayor demanda
    const dem = new Map<number, number>()
    ses.filter(s => s.estado !== 'cancelada').forEach(s => dem.set(s.idMateria, (dem.get(s.idMateria) ?? 0) + 1))
    this.demanda = this.barras([...dem].map(([id, v]) => ({ nombre: d.nombreMateria(id), valor: v })))

    // 4) Tasa de cancelación por tutor
    const tot = new Map<number, { t: number; c: number }>()
    ses.forEach(s => {
      const x = tot.get(s.idTutor) ?? { t: 0, c: 0 }
      x.t++; if (s.estado === 'cancelada') x.c++
      tot.set(s.idTutor, x)
    })
    this.cancelacion = [...tot].map(([id, x]) => ({ nombre: d.nombre(id), valor: x.c / x.t, pct: (x.c / x.t) * 100, extra: `${x.c}/${x.t}` }))
      .sort((a, b) => b.valor - a.valor).slice(0, 8)

    // 5) Ranking de tutores mejor calificados
    this.ranking = d.tutores.map(t => ({ nombre: d.nombre(t.idUsuario), ...d.promedio(t.idTutor), tarifa: Number(t.tarifaPorHora) }))
      .filter(x => x.n > 0).sort((a, b) => b.prom - a.prom || b.n - a.n).slice(0, 10)
  }

  private barras(l: { nombre: string; valor: number }[]): Barra[] {
    const max = Math.max(1, ...l.map(x => x.valor))
    return l.sort((a, b) => b.valor - a.valor).slice(0, 8).map(x => ({ ...x, pct: (x.valor / max) * 100 }))
  }
  nombreMes(k: string) {
    const [a, m] = k.split('-').map(Number)
    return new Date(a, m - 1, 1).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' })
  }
}
