import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Sesionservice } from '../../../services/sesionservice';
import { Toastservice } from '../../../core/toastservice';
import { SesionDTO } from '../../../models/SesionDTO';
import { ESTADOS_SESION } from '../../../models/Constantes';
import { EtiquetaPipe } from '../../../shared/pipes';
import { ahora } from '../../../core/fechas';
import { Jitsiservice } from '../../../core/jitsiservice';

@Component({
  selector: 'app-sinsert',
  imports: [FormsModule, RouterLink, EtiquetaPipe],
  templateUrl: './sinsertcomponent.html',
})
export class Sinsertcomponent implements OnInit {
  private dS = inject(Datosservice)
  private sS = inject(Sesionservice)
  private jitsi = inject(Jitsiservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  s = new SesionDTO()
  d = new Datos()
  estados = ESTADOS_SESION
  id = 0
  error = ''

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
    this.dS.cargar(['usuarios', 'tutores', 'estudiantes', 'materias', 'sesiones']).subscribe(d => {
      this.d = d
      const a = d.sesion(this.id)
      if (a) this.s = { ...a, fechaInicio: a.fechaInicio.substring(0, 16), fechaFin: a.fechaFin.substring(0, 16) }
      else this.s.enlaceJitsi = this.jitsi.nuevoEnlace()
    })
  }

  materiasDelTutor() {
    const t = this.d.tutor(this.s.idTutor)
    return t && t.idMaterias?.length ? this.d.materias.filter(m => t.idMaterias.includes(m.idMateria)) : this.d.materias
  }
  generarEnlace() { this.s.enlaceJitsi = this.jitsi.nuevoEnlace() }

  aceptar() {
    this.error = ''
    const s = this.s
    if (!s.idEstudiante || !s.idTutor || !s.idMateria || !s.fechaInicio || !s.fechaFin || !s.estado) { this.error = 'Completa todos los campos obligatorios'; return }
    if (s.fechaFin <= s.fechaInicio) { this.error = 'La fecha de fin debe ser posterior al inicio'; return }
    const body: SesionDTO = {
      ...s,
      fechaInicio: s.fechaInicio.length === 16 ? s.fechaInicio + ':00' : s.fechaInicio,
      fechaFin: s.fechaFin.length === 16 ? s.fechaFin + ':00' : s.fechaFin,
      fechaCreacion: s.fechaCreacion ?? ahora(),
    }
    const p = this.id ? this.sS.update(this.id, body) : this.sS.insert(body)
    p.subscribe({
      next: () => { this.toast.ok('Sesión guardada'); this.router.navigate(['/admin/sesiones']) },
      error: e => this.error = e.error?.error ?? 'Error al guardar',
    })
  }
}
