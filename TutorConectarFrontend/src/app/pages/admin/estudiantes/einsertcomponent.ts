import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Estudianteservice } from '../../../services/estudianteservice';
import { Toastservice } from '../../../core/toastservice';
import { Loginservice } from '../../../core/loginservice';
import { EstudianteDTO } from '../../../models/EstudianteDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';

/** Formulario de estudiante. Lo usa el admin y el propio estudiante (/estudiante/perfil) */
@Component({
  selector: 'app-einsert',
  imports: [FormsModule, RouterLink],
  templateUrl: './einsertcomponent.html',
})
export class Einsertcomponent implements OnInit {
  private dS = inject(Datosservice)
  private eS = inject(Estudianteservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private auth = inject(Loginservice)
  e = new EstudianteDTO()
  d = new Datos()
  disponibles: UsuarioDTO[] = []
  id = 0
  existe = false
  esEstudiante = false
  error = ''

  ngOnInit() {
    this.esEstudiante = this.auth.rol() === 'ESTUDIANTE'
    this.id = this.esEstudiante ? this.auth.id() : Number(this.route.snapshot.paramMap.get('id') ?? 0)
    this.dS.cargar(['usuarios', 'estudiantes', 'roles']).subscribe(d => {
      this.d = d
      const con = new Set(d.estudiantes.map(x => x.idEstudiante))
      this.disponibles = d.usuarios.filter(u => d.nombreRol(u.idRol).toUpperCase() === 'ESTUDIANTE' && !con.has(u.idUsuario))
      const actual = d.estudiantes.find(x => x.idEstudiante === this.id)
      if (actual) { this.e = { ...actual }; this.existe = true }
      else if (this.esEstudiante) this.e.idUsuario = this.id
    })
  }

  aceptar() {
    if (!this.e.idUsuario) { this.error = 'Selecciona el usuario'; return }
    if (this.e.presupuestoMaximo != null && this.e.presupuestoMaximo < 0) { this.error = 'El presupuesto no puede ser negativo'; return }
    const p = this.existe ? this.eS.update(this.e.idEstudiante, this.e) : this.eS.insert(this.e)
    p.subscribe({
      next: () => {
        this.toast.ok('Datos guardados')
        this.existe = true
        this.router.navigate([this.esEstudiante ? '/estudiante/panel' : '/admin/estudiantes'])
      },
      error: err => this.error = err.error?.error ?? 'Error al guardar',
    })
  }
}
