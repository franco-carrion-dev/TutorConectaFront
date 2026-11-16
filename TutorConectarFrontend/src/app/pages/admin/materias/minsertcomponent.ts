import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Materiaservice } from '../../../services/materiaservice';
import { Toastservice } from '../../../core/toastservice';
import { MateriaDTO } from '../../../models/MateriaDTO';
import { NIVELES } from '../../../models/Constantes';

@Component({
  selector: 'app-minsert',
  imports: [FormsModule, RouterLink],
  templateUrl: './minsertcomponent.html',
})
export class Minsertcomponent implements OnInit {
  private mS = inject(Materiaservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  m = new MateriaDTO()
  niveles = NIVELES
  id = 0
  error = ''

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
    if (this.id) this.mS.listId(this.id).subscribe({ next: x => this.m = x, error: e => this.toast.http(e) })
  }
  aceptar() {
    if (!this.m.nombre?.trim() || !this.m.nivelEducativo) { this.error = 'Nombre y nivel son obligatorios'; return }
    if (this.m.nombre.length > 100) { this.error = 'El nombre admite máximo 100 caracteres'; return }
    const p = this.id ? this.mS.update(this.id, this.m) : this.mS.insert(this.m)
    p.subscribe({
      next: () => { this.toast.ok('Materia guardada'); this.router.navigate(['/admin/materias']) },
      error: e => this.error = e.status === 403 ? 'Solo un administrador puede gestionar materias' : 'Error al guardar',
    })
  }
}
