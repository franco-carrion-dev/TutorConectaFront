import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { Toastservice } from '../../core/toastservice';
import { Pagoservice } from '../../services/pagoservice';
import { PagoDTO } from '../../models/PagoDTO';
import { EtiquetaPipe } from '../../shared/pipes';

@Component({
  selector: 'app-epagos',
  imports: [RouterLink, DatePipe, CurrencyPipe, EtiquetaPipe],
  templateUrl: './epagoscomponent.html',
})
export class Epagoscomponent implements OnInit {
  private dS = inject(Datosservice)
  private pS = inject(Pagoservice)
  private toast = inject(Toastservice)
  private auth = inject(Loginservice)
  d = new Datos()
  lista: PagoDTO[] = []
  cargando = true

  ngOnInit() { this.cargar() }
  cargar() {
    this.dS.cargar(['pagos', 'sesiones', 'usuarios', 'materias']).subscribe(d => {
      this.d = d
      const mias = new Set(d.sesiones.filter(s => s.idEstudiante === this.auth.id()).map(s => s.idSesion))
      this.lista = d.pagos.filter(p => mias.has(p.idSesion)).sort((a, b) => (b.fechaPago ?? '').localeCompare(a.fechaPago ?? ''))
      this.cargando = false
    })
  }
  get total() { return this.lista.filter(p => p.estado === 'COMPLETADO').reduce((a, p) => a + Number(p.monto), 0) }

  /** Abre una disputa de pago que resuelve el administrador */
  reportar(p: PagoDTO) {
    if (!confirm('¿Reportar un problema con este pago? El administrador revisará el caso.')) return
    this.pS.update(p.idPago, { ...p, estado: 'EN_DISPUTA' }).subscribe({
      next: () => { p.estado = 'EN_DISPUTA'; this.toast.ok('Disputa registrada. Te avisaremos por correo.') },
      error: e => this.toast.http(e),
    })
  }
}
