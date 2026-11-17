import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Rolservice } from '../../../services/rolservice';
import { Toastservice } from '../../../core/toastservice';
import { RolDTO } from '../../../models/RolDTO';

@Component({
  selector: 'app-rinsert',
  imports: [FormsModule, RouterLink],
  templateUrl: './rinsertcomponent.html',
})
export class Rinsertcomponent implements OnInit {
  private rS = inject(Rolservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  r = new RolDTO()
  id = 0
  error = ''

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
    if (this.id) this.rS.listId(this.id).subscribe({ next: x => this.r = x, error: e => this.toast.http(e) })
  }

  aceptar() {
    if (!this.r.denominacion?.trim()) { this.error = 'La denominación es obligatoria'; return }
    this.r.denominacion = this.r.denominacion.trim().toUpperCase()
    const p = this.id ? this.rS.update(this.id, this.r) : this.rS.insert(this.r)
    p.subscribe({
      next: () => { this.toast.ok('Rol guardado'); this.router.navigate(['/admin/roles']) },
      error: e => this.error = e.status === 403 ? 'Solo un administrador puede gestionar roles' : 'Error al guardar',
    })
  }
}
