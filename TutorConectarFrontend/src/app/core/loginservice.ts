import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type Rol = 'ADMIN' | 'TUTOR' | 'ESTUDIANTE'

export interface Sesionusuario {
  token: string
  email: string
  rol: Rol | null
  idUsuario: number
  nombre: string
  exp: number
}

export interface RegistroDTO {
  nombre: string
  apellido: string
  email: string
  password: string
  rol: 'TUTOR' | 'ESTUDIANTE'
  biografia?: string
  tarifaPorHora?: number | null
  presupuestoMaximo?: number | null
}

const CLAVE = 'tc_sesion'

@Injectable({ providedIn: 'root' })
export class Loginservice {
  private http = inject(HttpClient)
  /** Usuario autenticado (null si no hay sesión) */
  usuario = signal<Sesionusuario | null>(this.leer())

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.base}/api/auth/login`, { email, password }).pipe(
      tap(res => {
        const payload = this.decodificar(res.token)
        const authorities: string[] = payload?.authorities ?? res.roles ?? []
        const s: Sesionusuario = {
          token: res.token,
          email: payload?.sub ?? email,
          rol: this.rolDesde(authorities),
          idUsuario: Number(res.idUsuario ?? 0),
          nombre: res.nombre ?? email,
          exp: (payload?.exp ?? 0) * 1000,
        }
        if (typeof localStorage !== 'undefined') localStorage.setItem(CLAVE, JSON.stringify(s))
        this.usuario.set(s)
      })
    )
  }

  registro(dto: RegistroDTO): Observable<any> {
    return this.http.post(`${environment.base}/api/auth/registro`, dto)
  }

  /** Completa idUsuario/nombre si el backend no los mandó en el login */
  completar(id: number, nombre: string) {
    const s = this.usuario()
    if (!s) return
    const n = { ...s, idUsuario: id, nombre }
    if (typeof localStorage !== 'undefined') localStorage.setItem(CLAVE, JSON.stringify(n))
    this.usuario.set(n)
  }

  logout() {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(CLAVE)
    this.usuario.set(null)
  }

  token(): string | null { return this.usuario()?.token ?? null }
  rol(): Rol | null { return this.usuario()?.rol ?? null }
  id(): number { return this.usuario()?.idUsuario ?? 0 }

  verificar(): boolean {
    const s = this.usuario()
    if (!s) return false
    if (s.exp && Date.now() > s.exp) { this.logout(); return false }
    return true
  }

  /** Ruta de inicio según el rol */
  inicio(): string {
    switch (this.rol()) {
      case 'ADMIN': return '/admin/dashboard'
      case 'TUTOR': return '/tutor/panel'
      case 'ESTUDIANTE': return '/estudiante/panel'
      default: return '/login'
    }
  }

  private rolDesde(auth: string[]): Rol | null {
    const r = auth.map(a => a.replace('ROLE_', '').toUpperCase())
    if (r.some(x => x.startsWith('ADMIN'))) return 'ADMIN'
    if (r.includes('TUTOR')) return 'TUTOR'
    if (r.includes('ESTUDIANTE')) return 'ESTUDIANTE'
    return null
  }

  private decodificar(token: string): any {
    try {
      const p = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(decodeURIComponent(escape(atob(p))))
    } catch { return null }
  }

  private leer(): Sesionusuario | null {
    if (typeof localStorage === 'undefined') return null
    try { return JSON.parse(localStorage.getItem(CLAVE) || 'null') } catch { return null }
  }
}
