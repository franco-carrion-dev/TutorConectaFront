import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { Toastservice } from '../../core/toastservice';
import { Culqiservice } from '../../core/culqiservice';
import { Pagoservice } from '../../services/pagoservice';
import { Sesionservice } from '../../services/sesionservice';
import { SesionDTO } from '../../models/SesionDTO';
import { PagoDTO } from '../../models/PagoDTO';
import { ahora } from '../../core/fechas';

/** Pago de la sesión ANTES de la confirmación final (Culqi sandbox o pago de prueba) */
@Component({
  selector: 'app-epago',
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './epagocomponent.html',
  styleUrl: './epagocomponent.css',
})
export class Epagocomponent implements OnInit {
  private dS = inject(Datosservice)
  private pS = inject(Pagoservice)
  private sS = inject(Sesionservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private auth = inject(Loginservice)
  culqi = inject(Culqiservice)
  d = new Datos()
  s: SesionDTO | undefined
  pagado: PagoDTO | undefined
  monto = 0
  metodo: 'tarjeta' | 'yape' | 'culqi' = 'tarjeta'
  tarjeta = { numero: '4111 1111 1111 1111', nombre: '', venc: '12/28', cvv: '123' }
  yape = { celular: '', codigo: '' }
  procesando = false
  error = ''
  exito = false

  ngOnInit() {
    if (this.culqi.habilitado) this.metodo = 'culqi'
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.dS.cargar(['sesiones', 'pagos', 'tutores', 'usuarios', 'materias']).subscribe(d => {
      this.d = d
      this.s = d.sesion(id)
      if (!this.s || this.s.idEstudiante !== this.auth.id()) { this.s = undefined; return }
      this.pagado = d.pagosDeSesion(id).find(p => p.estado === 'COMPLETADO')
      const t = d.tutor(this.s.idTutor)
      this.monto = Math.round(Number(t?.tarifaPorHora ?? 0) * d.horas(this.s) * 100) / 100
      this.tarjeta.nombre = this.auth.usuario()?.nombre ?? ''
    })
  }

  async pagar() {
    this.error = ''
    if (!this.s) return
    let referencia = ''
    try {
      if (this.metodo === 'culqi') {
        this.procesando = true
        const token = await this.culqi.pagar(`Sesión #${this.s.idSesion}`, this.monto, this.auth.usuario()?.email ?? '')
        referencia = `Culqi ${token}`.substring(0, 50)
      } else if (this.metodo === 'tarjeta') {
        const n = this.tarjeta.numero.replace(/\s/g, '')
        if (!/^\d{15,16}$/.test(n) || !this.luhn(n)) { this.error = 'Número de tarjeta no válido'; return }
        if (!/^\d{2}\/\d{2}$/.test(this.tarjeta.venc)) { this.error = 'Vencimiento con formato MM/AA'; return }
        if (!/^\d{3,4}$/.test(this.tarjeta.cvv)) { this.error = 'CVV no válido'; return }
        if (n.startsWith('4000')) { this.error = 'Tarjeta rechazada por el banco (prueba)'; return }
        referencia = `Tarjeta **** ${n.slice(-4)}`
      } else {
        if (!/^9\d{8}$/.test(this.yape.celular)) { this.error = 'Celular de 9 dígitos que empiece en 9'; return }
        if (!/^\d{6}$/.test(this.yape.codigo)) { this.error = 'Código de aprobación de 6 dígitos'; return }
        referencia = `Yape ***${this.yape.celular.slice(-3)}`
      }
    } catch (e: any) {
      this.procesando = false
      this.error = e?.message ?? 'Pago cancelado'
      return
    }

    this.procesando = true
    const pago: PagoDTO = { idPago: 0, idSesion: this.s.idSesion, monto: this.monto, fechaPago: ahora(), estado: 'COMPLETADO', metodoPago: referencia }
    this.pS.insert(pago).pipe(
      switchMap(() => this.sS.cambiarEstado(this.s!.idSesion, 'agendada'))
    ).subscribe({
      next: () => { this.procesando = false; this.exito = true; this.s!.estado = 'agendada'; this.toast.ok('¡Pago aprobado! Tu sesión está confirmada.') },
      error: e => { this.procesando = false; this.error = e.error?.error ?? 'No se pudo registrar el pago' },
    })
  }

  private luhn(n: string): boolean {
    let s = 0, alt = false
    for (let i = n.length - 1; i >= 0; i--) {
      let x = Number(n[i])
      if (alt) { x *= 2; if (x > 9) x -= 9 }
      s += x; alt = !alt
    }
    return s % 10 === 0
  }
}
