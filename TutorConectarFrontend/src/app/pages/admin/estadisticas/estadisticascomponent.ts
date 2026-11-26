import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtiquetaPipe, EstrellasPipe } from '../../../shared/pipes';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { Tutorservice } from '../../../services/tutorservice';
import { Estudianteservice } from '../../../services/estudianteservice';
import { Materiaservice } from '../../../services/materiaservice';
import { Sesionservice } from '../../../services/sesionservice';
import { Disponibilidadhorariaservice } from '../../../services/disponibilidadhorariaservice';
import { Pagoservice } from '../../../services/pagoservice';
import { Calificacionservice } from '../../../services/calificacionservice';
import { Reporteprogresoservice } from '../../../services/reporteprogresoservice';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { TutorDTO } from '../../../models/TutorDTO';
import { EstudianteDTO } from '../../../models/EstudianteDTO';
import { SesionDTO } from '../../../models/SesionDTO';
import { MateriaDTO } from '../../../models/MateriaDTO';
import { UsuariosPorRolDTO } from '../../../models/UsuariosPorRolDTO';

/** Una fila de gráfico de barras horizontal */
interface Barra { nombre: string; valor: number; pct: number; extra?: string }

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** Reportes del backend: 2 por cada entidad (consultas agregadas en la BD) */
@Component({
  selector: 'app-estadisticas',
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe, EtiquetaPipe, EstrellasPipe],
  templateUrl: './estadisticascomponent.html',
})
export class Estadisticascomponent implements OnInit {
  private uS = inject(Usuarioservice)
  private rS = inject(Rolservice)
  private tS = inject(Tutorservice)
  private eS = inject(Estudianteservice)
  private mS = inject(Materiaservice)
  private sS = inject(Sesionservice)
  private dS = inject(Disponibilidadhorariaservice)
  private pS = inject(Pagoservice)
  private cS = inject(Calificacionservice)
  private rpS = inject(Reporteprogresoservice)

  // catálogos para mostrar nombres
  usuarios: UsuarioDTO[] = []
  materias: MateriaDTO[] = []

  // filtros
  anioUsuarios = new Date().getFullYear()
  anioPagos = new Date().getFullYear()
  activo = true
  tarifaMin = 30
  tarifaMax = 50
  presupuesto = 50
  desde = ''
  hasta = ''

  // Usuario
  registrosMes: Barra[] = []
  usuariosActivo: UsuarioDTO[] = []
  // Rol
  usuariosRol: UsuariosPorRolDTO[] = []
  porcentajeRol: Barra[] = []
  // Tutor
  ingresosTutor: Barra[] = []
  tutoresTarifa: TutorDTO[] = []
  // Estudiante
  gastosEstudiante: Barra[] = []
  estudiantesPresupuesto: EstudianteDTO[] = []
  // Materia
  sesionesMateria: Barra[] = []
  tutoresMateria: Barra[] = []
  // Sesión
  sesionesEstado: Barra[] = []
  sesionesRango: SesionDTO[] = []
  // Disponibilidad
  horasDia: Barra[] = []
  horasTutor: Barra[] = []
  // Pago
  pagosMetodo: Barra[] = []
  pagosMes: Barra[] = []
  // Calificación
  promedioTutor: Barra[] = []
  puntuaciones: Barra[] = []
  // Reporte de progreso
  progresoNivel: Barra[] = []
  progresoMateria: Barra[] = []

  ngOnInit() {
    const hoy = new Date()
    this.desde = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1).toISOString().substring(0, 10)
    this.hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().substring(0, 10)

    this.uS.list().subscribe(d => this.usuarios = d)
    this.mS.list().subscribe(d => this.materias = d)

    this.cargarRegistrosMes()
    this.cargarUsuariosActivo()
    this.rS.reporteUsuariosPorRol().subscribe(d => this.usuariosRol = d)
    this.rS.reportePorcentajePorRol().subscribe(d =>
      this.porcentajeRol = d.map(x => ({ nombre: x.denominacion, valor: x.porcentaje, pct: x.porcentaje, extra: `${x.cantidad} usuarios` })))

    this.tS.reporteIngresos().subscribe(d => this.ingresosTutor = this.barras(d.map(x => ({ nombre: x.nombreTutor, valor: x.totalIngresos, extra: `${x.sesionesPagadas} pagos` }))))
    this.buscarTutoresTarifa()

    this.eS.reporteGastos().subscribe(d => this.gastosEstudiante = this.barras(d.map(x => ({ nombre: x.nombreEstudiante, valor: x.totalGastado, extra: `${x.sesionesPagadas} pagos` }))))
    this.buscarEstudiantesPresupuesto()

    this.mS.reporteSesionesPorMateria().subscribe(d => this.sesionesMateria = this.barras(d.map(x => ({ nombre: x.nombre, valor: x.cantidad, extra: x.nivelEducativo }))))
    this.mS.reporteTutoresPorMateria().subscribe(d => this.tutoresMateria = this.barras(d.map(x => ({ nombre: x.nombre, valor: x.cantidad, extra: x.nivelEducativo }))))

    this.sS.reportePorEstado().subscribe(d => this.sesionesEstado = this.barras(d.map(x => ({ nombre: x.estado, valor: x.cantidad }))))
    this.buscarSesionesRango()

    this.dS.reporteHorasPorDia().subscribe(d => this.horasDia = this.barras(d.map(x => ({ nombre: x.diaSemana, valor: x.totalHoras, extra: `${x.bloques} bloques` }))))
    this.dS.reporteHorasPorTutor().subscribe(d => this.horasTutor = this.barras(d.map(x => ({ nombre: x.nombreTutor, valor: x.totalHoras, extra: `${x.bloques} bloques` }))))

    this.pS.reportePorMetodo().subscribe(d => this.pagosMetodo = this.barras(d.map(x => ({ nombre: x.metodoPago, valor: x.montoTotal, extra: `${x.cantidad} pagos` }))))
    this.cargarPagosMes()

    this.cS.reportePromedioPorTutor().subscribe(d =>
      this.promedioTutor = d.map(x => ({ nombre: x.nombreTutor, valor: x.promedio, pct: (x.promedio / 5) * 100, extra: `${x.cantidad} calif.` })))
    this.cS.reportePorPuntuacion().subscribe(d => this.puntuaciones = this.barras(d.map(x => ({ nombre: String(x.puntuacion), valor: x.cantidad }))))

    this.rpS.reportePorNivel().subscribe(d => this.progresoNivel = this.barras(d.map(x => ({ nombre: x.progreso, valor: x.cantidad }))))
    this.rpS.reportePorMateria().subscribe(d => this.progresoMateria = this.barras(d.map(x => ({ nombre: x.nombre, valor: x.cantidad, extra: x.nivelEducativo }))))
  }

  cargarRegistrosMes() {
    this.uS.reporteRegistrosPorMes(this.anioUsuarios).subscribe(d =>
      this.registrosMes = this.barras(d.map(x => ({ nombre: MESES[x.mes - 1], valor: x.cantidad }))))
  }

  cargarUsuariosActivo() {
    this.uS.listByActivo(this.activo).subscribe(d => this.usuariosActivo = d)
  }

  buscarTutoresTarifa() {
    if (this.tarifaMin == null || this.tarifaMax == null) return
    this.tS.listByRangoTarifa(this.tarifaMin, this.tarifaMax).subscribe(d => this.tutoresTarifa = d)
  }

  buscarEstudiantesPresupuesto() {
    if (this.presupuesto == null) return
    this.eS.listByPresupuestoMinimo(this.presupuesto).subscribe(d => this.estudiantesPresupuesto = d)
  }

  buscarSesionesRango() {
    if (!this.desde || !this.hasta) return
    this.sS.listByRango(this.desde, this.hasta).subscribe(d => this.sesionesRango = d)
  }

  cargarPagosMes() {
    this.pS.reportePorMes(this.anioPagos).subscribe(d =>
      this.pagosMes = this.barras(d.map(x => ({ nombre: MESES[x.mes - 1], valor: x.montoTotal, extra: `${x.cantidad} pagos` }))))
  }

  nombre(idUsuario: number | null | undefined): string {
    const u = this.usuarios.find(x => x.idUsuario === idUsuario)
    return u ? `${u.nombre} ${u.apellido}` : `#${idUsuario}`
  }

  nombreMateria(idMateria: number): string {
    return this.materias.find(m => m.idMateria === idMateria)?.nombre ?? `#${idMateria}`
  }

  num(v: string): number { return Number(v) }

  /** Calcula el ancho (%) de cada barra respecto al valor máximo */
  private barras(filas: { nombre: string; valor: number; extra?: string }[]): Barra[] {
    const max = Math.max(1, ...filas.map(f => Number(f.valor)))
    return filas.map(f => ({ ...f, valor: Number(f.valor), pct: (Number(f.valor) / max) * 100 }))
  }
}
