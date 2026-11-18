import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Materiaservice } from '../../../services/materiaservice';
import { Toastservice } from '../../../core/toastservice';
import { MateriaDTO } from '../../../models/MateriaDTO';
import { NIVELES } from '../../../models/Constantes';
import { normalizar } from '../../../core/fechas';

@Component({
  selector: 'app-mlist',
  imports: [FormsModule, RouterLink],
  templateUrl: './mlistcomponent.html',
  styleUrl: './mlistcomponent.css',
})
export class Mlistcomponent implements OnInit {
  private mS = inject(Materiaservice)
  private toast = inject(Toastservice)
  todas: MateriaDTO[] = []
  lista: MateriaDTO[] = []
  niveles = NIVELES
  texto = ''
  nivel = ''
  cargando = true

  ngOnInit() { this.cargar() }
  cargar() {
    this.mS.list().subscribe({
      next: r => { this.todas = r; this.cargando = false; this.filtrar() },
      error: e => { this.cargando = false; this.toast.http(e) },
    })
  }
  filtrar() {
    const t = normalizar(this.texto)
    this.lista = this.todas.filter(m => (!t || normalizar(m.nombre).includes(t)) && (!this.nivel || m.nivelEducativo === this.nivel))
  }
  eliminar(m: MateriaDTO) {
    if (!confirm(`¿Eliminar la materia ${m.nombre}?`)) return
    this.mS.delete(m.idMateria).subscribe({
      next: () => { this.toast.ok('Materia eliminada'); this.cargar() },
      error: e => this.toast.http(e, 'No se pudo eliminar: tiene sesiones o tutores asociados'),
    })
  }
}
