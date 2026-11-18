import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Tutorservice } from '../../../services/tutorservice';
import { Toastservice } from '../../../core/toastservice';
import { Loginservice } from '../../../core/loginservice';
import { TutorDTO } from '../../../models/TutorDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { errTarifa } from '../../../shared/validaciones';

/** Formulario de tutor. Lo usa el admin (/admin/tutores) y el propio tutor (/tutor/perfil) */
@Component({
  selector: 'app-tinsert',
  imports: [FormsModule, RouterLink],
  templateUrl: './tinsertcomponent.html',
})
export class Tinsertcomponent implements OnInit {
  private dS = inject(Datosservice)
  private tS = inject(Tutorservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  auth = inject(Loginservice)

  t = new TutorDTO()
  d = new Datos()
  disponibles: UsuarioDTO[] = []
  id = 0
  esTutor = false
  existe = false
  error = ''
  enviado = false
  errTarifa = errTarifa

  ngOnInit() {
    this.esTutor = this.auth.rol() === 'TUTOR'
    this.id = this.esTutor ? this.auth.id() : Number(this.route.snapshot.paramMap.get('id') ?? 0)
    this.dS.cargar(['usuarios', 'tutores', 'materias', 'roles']).subscribe(d => {
      this.d = d
      const conPerfil = new Set(d.tutores.map(x => x.idTutor))
      this.disponibles = d.usuarios.filter(u => (d.nombreRol(u.idRol)).toUpperCase() === 'TUTOR' && !conPerfil.has(u.idUsuario))
      const actual = d.tutor(this.id)
      if (actual) { this.t = { ...actual, idMaterias: [...(actual.idMaterias ?? [])] }; this.existe = true }
      else if (this.esTutor) { this.t.idUsuario = this.id }
    })
  }

  marcada(id: number) { return this.t.idMaterias.includes(id) }
  alternar(id: number) {
    this.t.idMaterias = this.marcada(id) ? this.t.idMaterias.filter(x => x !== id) : [...this.t.idMaterias, id]
  }

  aceptar() {
    this.error = ''
    this.enviado = true
    if (errTarifa(this.t.tarifaPorHora)) { this.error = 'Revisa los campos marcados'; return }
    if (!this.t.idUsuario) { this.error = 'Selecciona el usuario'; return }
    if (!this.t.tarifaPorHora || this.t.tarifaPorHora <= 0) { this.error = 'La tarifa debe ser mayor a 0'; return }
    if (!this.t.idMaterias.length) { this.error = 'Selecciona al menos una materia que dictes'; return }
    const p = this.existe ? this.tS.update(this.t.idTutor, this.t) : this.tS.insert(this.t)
    p.subscribe({
      next: () => {
        this.toast.ok('Perfil de tutor guardado')
        if (this.esTutor) { this.existe = true; this.router.navigate(['/tutor/panel']) }
        else this.router.navigate(['/admin/tutores'])
      },
      error: e => this.error = e.error?.error ?? 'Error al guardar',
    })
  }
}
