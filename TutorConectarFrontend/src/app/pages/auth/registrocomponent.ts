import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Loginservice, RegistroDTO } from '../../core/loginservice';
import { Toastservice } from '../../core/toastservice';
import { errPresupuesto, errTarifa } from '../../shared/validaciones';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registrocomponent.html',
  styleUrl: './auth.css',
})
export class Registrocomponent {
  private auth = inject(Loginservice)
  private router = inject(Router)
  private toast = inject(Toastservice)
  dto: RegistroDTO = { nombre: '', apellido: '', email: '', password: '', rol: 'ESTUDIANTE', biografia: '', tarifaPorHora: null, presupuestoMaximo: null }
  confirmar = ''
  error = ''
  cargando = false
  enviado = false
  errTarifa = errTarifa
  errPresupuesto = errPresupuesto

  registrar() {
    this.error = ''
    const d = this.dto
    if (!d.nombre || !d.apellido || !d.email || !d.password) { this.error = 'Completa todos los campos obligatorios'; return }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) { this.error = 'El email no es válido'; return }
    if (d.password.length < 6) { this.error = 'La contraseña debe tener al menos 6 caracteres'; return }
    if (d.password !== this.confirmar) { this.error = 'Las contraseñas no coinciden'; return }
    this.enviado = true
    if (d.rol === 'TUTOR' && errTarifa(d.tarifaPorHora)) { this.error = errTarifa(d.tarifaPorHora); return }
    if (d.rol === 'ESTUDIANTE' && errPresupuesto(d.presupuestoMaximo)) { this.error = errPresupuesto(d.presupuestoMaximo); return }

    this.cargando = true
    this.auth.registro(d).subscribe({
      next: () => {
        // Iniciamos sesión directamente
        this.auth.login(d.email, d.password).subscribe({
          next: () => {
            this.toast.ok(d.rol === 'TUTOR'
              ? 'Cuenta creada. Tu perfil será publicado cuando un administrador verifique tu identidad.'
              : 'Cuenta creada. ¡Encuentra a tu tutor ideal!')
            this.router.navigateByUrl(this.auth.inicio())
          },
          error: () => this.router.navigate(['/login']),
        })
      },
      error: (e) => {
        this.cargando = false
        this.error = e.status === 409 ? 'Ese email ya está registrado' : (e.error?.error ?? 'No se pudo registrar')
      },
    })
  }
}
