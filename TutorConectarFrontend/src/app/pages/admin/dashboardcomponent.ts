import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../core/datosservice';
import { EstrellasPipe } from '../../shared/pipes';
import { ETIQUETA_ESTADO } from '../../models/Constantes';

interface Barra { nombre: string; valor: number; pct: number; extra?: string; color?: string }
interface Seg { nombre: string; valor: number; color: string; pct: number }
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
  usuariosRol: Seg[] = []
  donaRol = ''
  totalUsuarios = 0
  pagosEstado: Seg[] = []
  tortaPagos = ''
  ingresosMes: Barra[] = []
  linea = { puntos: '', area: '', marcas: [] as { x: number; y: number; v: number; et: string }[] }
  distCalif: Barra[] = []
  horasDia: Barra[] = []

  ngOnInit() {
    const hoy = new Date()
    const ini = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1)
    this.desde = ini.toISOString().substring(0, 10)
    this.hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0).toISOString().substring(0, 10)
    this.dS.cargar(['sesiones', 'pagos', 'calificaciones', 'tutores', 'estudiantes', 'usuarios', 'materias', 'roles', 'disponibilidades'])
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

    // 6) Usuarios por rol (total y activos)
    const porRol = new Map<number, { t: number; a: number }>()
    d.usuarios.forEach(u => {
      const x = porRol.get(u.idRol) ?? { t: 0, a: 0 }
      x.t++; if (u.activo) x.a++
      porRol.set(u.idRol, x)
    })
    const colRol = ['var(--primary-700)', 'var(--accent-500)', 'var(--success-700)', 'var(--info-700)', 'var(--error-700)']
    this.usuariosRol = this.segmentos([...porRol].map(([id, x], i) => ({ nombre: `${d.nombreRol(id)} (${x.a} activos)`, valor: x.t, color: colRol[i % colRol.length] })))
    this.totalUsuarios = d.usuarios.length
    this.donaRol = this.conico(this.usuariosRol)

    // 7) Pagos por estado (de las sesiones del periodo)
    const colorPago: Record<string, string> = {
      PENDIENTE: 'var(--warning-700)', COMPLETADO: 'var(--success-700)', EN_DISPUTA: 'var(--accent-500)',
      REEMBOLSADO: 'var(--gray-500)', RECHAZADO: 'var(--error-700)',
    }
    const pagosPer = d.pagos.filter(p => idsSes.has(p.idSesion))
    this.pagosEstado = this.segmentos(Object.keys(colorPago).map(e => ({
      nombre: ETIQUETA_ESTADO[e] ?? e, valor: pagosPer.filter(p => p.estado === e).length, color: colorPago[e],
    })).filter(x => x.valor > 0))
    this.tortaPagos = this.conico(this.pagosEstado)

    // 8) Ingresos por mes (pagos completados)
    const ingMes = new Map<string, number>()
    pagosOk.forEach(p => {
      const k = (p.fechaPago || d.sesion(p.idSesion)?.fechaInicio || '').substring(0, 7)
      if (k) ingMes.set(k, (ingMes.get(k) ?? 0) + Number(p.monto))
    })
    const maxIng = Math.max(1, ...ingMes.values())
    this.ingresosMes = [...ingMes].sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ nombre: this.nombreMes(k), valor: v, pct: (v / maxIng) * 100 }))
    // coordenadas del gráfico de línea (viewBox 320 x 160, margen 20)
    const n = this.ingresosMes.length
    const pts = this.ingresosMes.map((b, i) => ({
      x: n === 1 ? 160 : 20 + (i * 280) / (n - 1), y: 140 - (b.valor / maxIng) * 110, v: b.valor, et: b.nombre,
    }))
    this.linea = {
      puntos: pts.map(p => `${p.x},${p.y}`).join(' '),
      area: pts.length ? `${pts[0].x},140 ${pts.map(p => `${p.x},${p.y}`).join(' ')} ${pts[pts.length - 1].x},140` : '',
      marcas: pts,
    }

    // 9) Distribución de calificaciones (1 a 5 estrellas)
    const califs = d.calificaciones.filter(c => idsSes.has(c.idSesion))
    const maxCal = Math.max(1, ...[1, 2, 3, 4, 5].map(n => califs.filter(c => c.puntuacion === n).length))
    this.distCalif = [1, 2, 3, 4, 5].map(n => {
      const v = califs.filter(c => c.puntuacion === n).length
      return { nombre: '★'.repeat(n), valor: v, pct: (v / maxCal) * 100 }
    })

    // 10) Horas de disponibilidad de los tutores por día de la semana
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    const norm = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const hrs = (a: string, b: string) => {
      const [h1, m1] = a.split(':').map(Number), [h2, m2] = b.split(':').map(Number)
      return Math.max(0, (h2 * 60 + m2 - h1 * 60 - m1) / 60)
    }
    const porDia = dias.map(di => d.disponibilidades.filter(x => x.disponible && norm(x.diaSemana) === norm(di))
      .reduce((a, x) => a + hrs(x.horaInicio, x.horaFin), 0))
    const maxDia = Math.max(1, ...porDia)
    this.horasDia = dias.map((di, i) => ({ nombre: di, valor: porDia[i], pct: (porDia[i] / maxDia) * 100 }))
  }

  private segmentos(l: { nombre: string; valor: number; color: string }[]): Seg[] {
    const tot = l.reduce((a, x) => a + x.valor, 0) || 1
    return l.filter(x => x.valor > 0).map(x => ({ ...x, pct: (x.valor / tot) * 100 }))
  }
  /** conic-gradient para gráficos de dona y torta */
  private conico(l: Seg[]): string {
    if (!l.length) return 'var(--gray-100)'
    let acc = 0
    return 'conic-gradient(' + l.map(x => { const a = acc; acc += x.pct; return `${x.color} ${a}% ${acc}%` }).join(', ') + ')'
  }
  private barras(l: { nombre: string; valor: number; extra?: string; color?: string }[]): Barra[] {
    const max = Math.max(1, ...l.map(x => x.valor))
    return l.sort((a, b) => b.valor - a.valor).slice(0, 8).map(x => ({ ...x, pct: (x.valor / max) * 100 }))
  }
  nombreMes(k: string) {
    const [a, m] = k.split('-').map(Number)
    return new Date(a, m - 1, 1).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' })
  }
}
