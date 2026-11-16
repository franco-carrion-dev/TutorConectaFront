import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Reporteprogresoservice } from '../../../services/reporteprogresoservice';
import { Toastservice } from '../../../core/toastservice';
import { Loginservice } from '../../../core/loginservice';
import { ReporteProgresoDTO } from '../../../models/ReporteProgresoDTO';
import { PROGRESOS } from '../../../models/Constantes';
import { ahora } from '../../../core/fechas';

@Component({
  selector: 'app-repinsert',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './repinsertcomponent.html',
})
export class Repinsertcomponent implements OnInit {
  private dS = inject(Datosservice)
  private rS = inject(Reporteprogresoservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private auth = inject(Loginservice)
  r = new ReporteProgresoDTO()
  d = new Datos()
  niveles = Object.keys(PROGRESOS)
  esTutor = this.auth.rol() === 'TUTOR'
  base = this.esTutor ? '/tutor/reportes' : '/admin/reportes'
  id = 0
  error = ''

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
    const sesionQ = Number(this.route.snapshot.queryParamMap.get('sesion') ?? 0)
    this.dS.cargar(['sesiones', 'usuarios', 'materias']).subscribe(d => {
      this.d = d
      if (this.id) {
        this.rS.listId(this.id).subscribe({ next: x => this.r = x, error: e => this.toast.http(e) })
      } else if (sesionQ) { this.r.idSesion = sesionQ; this.alElegir() }
    })
  }
  sesiones() {
    return this.d.sesiones.filter(s => (!this.esTutor || s.idTutor === this.auth.id()) && (s.estado === 'realizada' || s.idSesion === this.r.idSesion))
  }
  alElegir() { this.r.idTutor = this.d.sesion(this.r.idSesion)?.idTutor ?? 0 }

  aceptar() {
    this.error = ''
    if (!this.r.idSesion || !this.r.idTutor) { this.error = 'Selecciona la sesión'; return }
    if (!this.r.progreso) { this.error = 'Indica el nivel de progreso'; return }
    const body = { ...this.r, fechaReporte: this.r.fechaReporte || ahora() }
    const obs = this.id ? this.rS.update(this.id, body) : this.rS.insert(body)
    obs.subscribe({
      next: () => { this.toast.ok('Reporte guardado'); this.router.navigate([this.base]) },
      error: e => this.error = e.status === 403 ? 'Sin permisos (revisa SecurityConfig: /api/reportes-progreso)' : (e.error?.error ?? 'Error al guardar'),
    })
  }
}
