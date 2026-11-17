import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Rolservice } from '../../../services/rolservice';
import { Toastservice } from '../../../core/toastservice';
import { RolDTO } from '../../../models/RolDTO';

@Component({
  selector: 'app-rlist',
  imports: [RouterLink],
  templateUrl: './rlistcomponent.html',
})
export class Rlistcomponent implements OnInit {
  private rS = inject(Rolservice)
  private toast = inject(Toastservice)
  lista: RolDTO[] = []
  cargando = true

  ngOnInit() { this.cargar() }
  cargar() {
    this.rS.list().subscribe({ next: r => { this.lista = r; this.cargando = false }, error: e => { this.cargando = false; this.toast.http(e) } })
  }
  eliminar(r: RolDTO) {
    if (!confirm(`¿Eliminar el rol ${r.denominacion}?`)) return
    this.rS.delete(r.idRol).subscribe({
      next: () => { this.toast.ok('Rol eliminado'); this.cargar() },
      error: e => this.toast.http(e, 'No se pudo eliminar: hay usuarios con este rol'),
    })
  }
}
