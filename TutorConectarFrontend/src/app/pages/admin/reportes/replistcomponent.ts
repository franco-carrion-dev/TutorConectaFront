import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Reporteprogresoservice } from '../../../services/reporteprogresoservice';
import { Toastservice } from '../../../core/toastservice';
import { Loginservice } from '../../../core/loginservice';
import { ReporteProgresoDTO } from '../../../models/ReporteProgresoDTO';
import { PROGRESOS } from '../../../models/Constantes';

/** Reportes de progreso. Admin: todos (filtro por tutor/estudiante). Tutor: los suyos */
@Component({
  selector: 'app-replist',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './replistcomponent.html',
})
export class Replistcomponent implements OnInit {
  private dS = inject(Datosservice)
  private rS = inject(Reporteprogresoservice)
  private toast = inject(Toastservice)
  private auth = inject(Loginservice)
  d = new Datos()
  lista: ReporteProgresoDTO[] = []
  esTutor = this.auth.rol() === 'TUTOR'
  base = this.esTutor ? '/tutor/reportes' : '/admin/reportes'
  idTutor: number | null = null
  idEstudiante: number | null = null
  cargando = true
  pct = PROGRESOS

  ngOnInit() {
    this.dS.cargar(['usuarios', 'tutores', 'estudiantes', 'sesiones', 'materias']).subscribe(d => { this.d = d; this.buscar() })
  }

  /** Backend: /api/reportes-progreso/tutor/{id} y /estudiante/{id} */
  buscar() {
    this.cargando = true
    const obs = this.esTutor ? this.rS.listByTutor(this.auth.id())
      : this.idTutor ? this.rS.listByTutor(this.idTutor)
      : this.idEstudiante ? this.rS.listByEstudiante(this.idEstudiante)
      : this.rS.list()
    obs.subscribe({
      next: r => {
        this.lista = (!this.esTutor && this.idTutor && this.idEstudiante
          ? r.filter(x => this.d.sesion(x.idSesion)?.idEstudiante === this.idEstudiante) : r)
          .sort((a, b) => (b.fechaReporte ?? '').localeCompare(a.fechaReporte ?? ''))
        this.cargando = false
      },
      error: e => { this.cargando = false; this.toast.http(e) },
    })
  }
  eliminar(r: ReporteProgresoDTO) {
    if (!confirm(`¿Eliminar el reporte #${r.idReporte}?`)) return
    this.rS.delete(r.idReporte).subscribe({ next: () => { this.toast.ok('Reporte eliminado'); this.buscar() }, error: e => this.toast.http(e) })
  }
}
