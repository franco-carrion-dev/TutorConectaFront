import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { Tutorservice } from '../../../services/tutorservice';
import { Estudianteservice } from '../../../services/estudianteservice';
import { Toastservice } from '../../../core/toastservice';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { RolDTO } from '../../../models/RolDTO';
import { ahora } from '../../../core/fechas';

@Component({
  selector: 'app-uinsert',
  imports: [FormsModule, RouterLink],
  templateUrl: './uinsertcomponent.html',
})
export class Uinsertcomponent implements OnInit {
  private uS = inject(Usuarioservice)
  private rS = inject(Rolservice)
  private tS = inject(Tutorservice)
  private eS = inject(Estudianteservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  u: UsuarioDTO = new UsuarioDTO()
  roles: RolDTO[] = []
  id = 0
  edicion = false
  error = ''
  guardando = false
  // datos del perfil al crear
  tarifa: number | null = null
  biografia = ''
  presupuesto: number | null = null

  ngOnInit() {
    this.rS.list().subscribe(r => this.roles = r)
    this.id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
    this.edicion = this.id > 0
    if (this.edicion) {
      this.uS.listId(this.id).subscribe({
        next: r => this.u = { ...r, passwordHash: '' },
        error: e => this.toast.http(e, 'No se pudo cargar el usuario'),
      })
    }
  }

  rolNombre(): string { return (this.roles.find(r => r.idRol === this.u.idRol)?.denominacion ?? '').toUpperCase() }

  aceptar() {
    this.error = ''
    const u = this.u
    if (!u.nombre || !u.apellido || !u.email || !u.idRol) { this.error = 'Completa nombre, apellido, email y rol'; return }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.email)) { this.error = 'Email no válido'; return }
    if (!this.edicion && (!u.passwordHash || u.passwordHash.length < 6)) { this.error = 'La contraseña debe tener al menos 6 caracteres'; return }
    if (!this.edicion && this.rolNombre() === 'TUTOR' && !this.tarifa) { this.error = 'Indica la tarifa por hora del tutor'; return }

    this.guardando = true
    if (this.edicion) {
      this.uS.update(this.id, u).subscribe({ next: () => this.fin('Usuario actualizado'), error: e => this.falla(e) })
      return
    }
    u.fechaRegistro = ahora()
    this.uS.insert(u).pipe(
      switchMap(creado => this.crearPerfil(creado.idUsuario))
    ).subscribe({ next: () => this.fin('Usuario registrado'), error: e => this.falla(e) })
  }

  /** Crea la fila en tutores/estudiantes según el rol */
  private crearPerfil(idUsuario: number): Observable<any> {
    const rol = this.rolNombre()
    if (rol === 'TUTOR') {
      return this.tS.insert({ idTutor: 0, idUsuario, biografia: this.biografia, tarifaPorHora: this.tarifa ?? 0, verificado: false, calificacionPromedio: 0, idMaterias: [] })
    }
    if (rol === 'ESTUDIANTE') {
      return this.eS.insert({ idEstudiante: 0, idUsuario, presupuestoMaximo: this.presupuesto })
    }
    return of(null)
  }

  private fin(m: string) { this.toast.ok(m); this.router.navigate(['/admin/usuarios']) }
  private falla(e: any) {
    this.guardando = false
    this.error = e.status === 409 || e.status === 500 ? 'No se pudo guardar (¿email duplicado?)' : (e.error?.error ?? 'Error al guardar')
  }
}
