import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Loginservice } from '../../core/loginservice';
import { Usuarioservice } from '../../services/usuarioservice';
import { Toastservice } from '../../core/toastservice';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './logincomponent.html',
  styleUrl: './auth.css',
})
export class Logincomponent {
  private auth = inject(Loginservice)
  private uS = inject(Usuarioservice)
  private router = inject(Router)
  private toast = inject(Toastservice)
  email = ''
  password = ''
  cargando = false
  error = ''
  expirada = !!inject(ActivatedRoute).snapshot.queryParamMap.get('expirada')

  ingresar() {
    this.error = ''
    if (!this.email || !this.password) { this.error = 'Ingresa tu email y contraseña'; return }
    this.cargando = true
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        if (!this.auth.rol()) {
          this.auth.logout()
          this.cargando = false
          this.error = 'Tu usuario no tiene un rol válido (ADMIN, TUTOR o ESTUDIANTE)'
          return
        }
        // Si el backend no devolvió idUsuario, lo obtenemos de /api/usuarios/me
        if (!this.auth.id()) {
          this.uS.me().subscribe({
            next: u => { this.auth.completar(u.idUsuario, `${u.nombre} ${u.apellido}`); this.entrar() },
            error: () => this.entrar(),
          })
        } else this.entrar()
      },
      error: (e) => {
        this.cargando = false
        this.error = e.status === 0 ? 'No se pudo conectar con el servidor' : 'Email o contraseña incorrectos'
      },
    })
  }

  private entrar() {
    this.cargando = false
    this.toast.ok(`¡Bienvenido, ${this.auth.usuario()?.nombre}!`)
    this.router.navigateByUrl(this.auth.inicio())
  }
}
