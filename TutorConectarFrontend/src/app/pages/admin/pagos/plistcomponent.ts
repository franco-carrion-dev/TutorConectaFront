import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Pagoservice } from '../../../services/pagoservice';
import { Toastservice } from '../../../core/toastservice';
import { PagoDTO } from '../../../models/PagoDTO';
import { ESTADOS_PAGO } from '../../../models/Constantes';
import { EtiquetaPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-plist',
  imports: [FormsModule, RouterLink, DatePipe, CurrencyPipe, EtiquetaPipe],
  templateUrl: './plistcomponent.html',
})
export class Plistcomponent implements OnInit {
  private dS = inject(Datosservice)
  private pS = inject(Pagoservice)
  private toast = inject(Toastservice)
  d = new Datos()
  lista: PagoDTO[] = []
  estados = ESTADOS_PAGO
  estado = ''
  idTutor: number | null = null
  cargando = true

  ngOnInit() {
    this.dS.cargar(['usuarios', 'tutores', 'sesiones', 'materias']).subscribe(d => { this.d = d; this.buscar() })
  }

  get disputas() { return this.lista.filter(p => p.estado === 'EN_DISPUTA').length }
  get total() { return this.lista.filter(p => p.estado === 'COMPLETADO').reduce((a, b) => a + Number(b.monto), 0) }

  /** Backend: /api/pagos/estado/{estado} y /api/pagos/tutor/{id}/estado/{estado} */
  buscar() {
    this.cargando = true
    const obs = this.idTutor && this.estado ? this.pS.listByTutorYEstado(this.idTutor, this.estado)
      : this.estado ? this.pS.listByEstado(this.estado) : this.pS.list()
    obs.subscribe({
      next: r => {
        this.lista = (this.idTutor && !this.estado ? r.filter(p => this.d.sesion(p.idSesion)?.idTutor === this.idTutor) : r)
          .sort((a, b) => (b.fechaPago ?? '').localeCompare(a.fechaPago ?? ''))
        this.cargando = false
      },
      error: e => { this.cargando = false; this.toast.http(e) },
    })
  }

  /** Resolver disputa / cambiar estado del pago */
  cambiar(p: PagoDTO, estado: string) {
    this.pS.update(p.idPago, { ...p, estado }).subscribe({
      next: () => { p.estado = estado; this.toast.ok(`Pago #${p.idPago}: ${estado}`) },
      error: e => this.toast.http(e),
    })
  }
  eliminar(p: PagoDTO) {
    if (!confirm(`¿Eliminar el pago #${p.idPago}?`)) return
    this.pS.delete(p.idPago).subscribe({ next: () => { this.toast.ok('Pago eliminado'); this.buscar() }, error: e => this.toast.http(e) })
  }
}
