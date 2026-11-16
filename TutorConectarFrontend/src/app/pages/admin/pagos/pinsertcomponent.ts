import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Pagoservice } from '../../../services/pagoservice';
import { Toastservice } from '../../../core/toastservice';
import { PagoDTO } from '../../../models/PagoDTO';
import { ESTADOS_PAGO, METODOS_PAGO } from '../../../models/Constantes';
import { EtiquetaPipe } from '../../../shared/pipes';
import { ahora } from '../../../core/fechas';

@Component({
  selector: 'app-pinsert',
  imports: [FormsModule, RouterLink, DatePipe, EtiquetaPipe],
  templateUrl: './pinsertcomponent.html',
})
export class Pinsertcomponent implements OnInit {
  private dS = inject(Datosservice)
  private pS = inject(Pagoservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  p = new PagoDTO()
  d = new Datos()
  estados = ESTADOS_PAGO
  metodos = METODOS_PAGO
  id = 0
  error = ''

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
    this.p.fechaPago = ahora().substring(0, 16)
    this.p.metodoPago = 'Tarjeta'
    this.dS.cargar(['pagos', 'sesiones', 'usuarios', 'tutores', 'materias']).subscribe(d => {
      this.d = d
      const a = d.pagos.find(x => x.idPago === this.id)
      if (a) this.p = { ...a, fechaPago: (a.fechaPago ?? '').substring(0, 16) }
    })
  }

  /** Sugerir monto = tarifa del tutor x horas */
  sugerir() {
    const s = this.d.sesion(this.p.idSesion)
    const t = this.d.tutor(s?.idTutor)
    if (s && t) this.p.monto = Math.round(Number(t.tarifaPorHora) * this.d.horas(s) * 100) / 100
  }

  aceptar() {
    this.error = ''
    if (!this.p.idSesion || this.p.monto == null || this.p.monto < 0 || !this.p.fechaPago || !this.p.estado) { this.error = 'Completa sesión, monto, fecha y estado'; return }
    const body = { ...this.p, fechaPago: this.p.fechaPago.length === 16 ? this.p.fechaPago + ':00' : this.p.fechaPago }
    const obs = this.id ? this.pS.update(this.id, body) : this.pS.insert(body)
    obs.subscribe({
      next: () => { this.toast.ok('Pago guardado'); this.router.navigate(['/admin/pagos']) },
      error: e => this.error = e.error?.error ?? 'Error al guardar',
    })
  }
}
