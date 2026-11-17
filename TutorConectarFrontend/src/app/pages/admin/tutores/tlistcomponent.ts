import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Tutorservice } from '../../../services/tutorservice';
import { Toastservice } from '../../../core/toastservice';
import { TutorDTO } from '../../../models/TutorDTO';
import { normalizar } from '../../../core/fechas';
import { EstrellasPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-tlist',
  imports: [FormsModule, RouterLink, CurrencyPipe, DecimalPipe, EstrellasPipe],
  templateUrl: './tlistcomponent.html',
})
export class Tlistcomponent implements OnInit {
  private dS = inject(Datosservice)
  private tS = inject(Tutorservice)
  private toast = inject(Toastservice)
  d = new Datos()
  lista: TutorDTO[] = []
  texto = ''
  idMateria: number | null = null
  verif = ''
  cargando = true

  ngOnInit() { this.cargar() }
  cargar() {
    this.dS.cargar(['tutores', 'usuarios', 'materias', 'calificaciones']).subscribe(d => { this.d = d; this.cargando = false; this.filtrar() })
  }
  filtrar() {
    const t = normalizar(this.texto)
    this.lista = this.d.tutores.filter(x =>
      (!t || normalizar(this.d.nombre(x.idUsuario)).includes(t)) &&
      (!this.idMateria || (x.idMaterias ?? []).includes(this.idMateria)) &&
      (!this.verif || String(!!x.verificado) === this.verif))
  }
  materias(t: TutorDTO): string { return (t.idMaterias ?? []).map(id => this.d.nombreMateria(id)).join(', ') || '—' }

  /** Validación de identidad: solo los tutores verificados aparecen en las búsquedas */
  verificar(t: TutorDTO) {
    const body = { ...t, verificado: !t.verificado }
    this.tS.update(t.idTutor, body).subscribe({
      next: () => { t.verificado = !t.verificado; this.toast.ok(t.verificado ? 'Tutor verificado: su perfil ya es público' : 'Verificación retirada') },
      error: e => this.toast.http(e),
    })
  }
  eliminar(t: TutorDTO) {
    if (!confirm(`¿Eliminar el perfil de tutor de ${this.d.nombre(t.idUsuario)}?`)) return
    this.tS.delete(t.idTutor).subscribe({
      next: () => { this.toast.ok('Tutor eliminado'); this.cargar() },
      error: e => this.toast.http(e, 'No se pudo eliminar: tiene sesiones o disponibilidades'),
    })
  }
}
