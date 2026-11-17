import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../../core/datosservice';
import { Estudianteservice } from '../../../services/estudianteservice';
import { Toastservice } from '../../../core/toastservice';
import { EstudianteDTO } from '../../../models/EstudianteDTO';
import { normalizar } from '../../../core/fechas';

@Component({
  selector: 'app-elist',
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './elistcomponent.html',
})
export class Elistcomponent implements OnInit {
  private dS = inject(Datosservice)
  private eS = inject(Estudianteservice)
  private toast = inject(Toastservice)
  d = new Datos()
  lista: EstudianteDTO[] = []
  texto = ''
  cargando = true

  ngOnInit() { this.cargar() }
  cargar() {
    this.dS.cargar(['estudiantes', 'usuarios', 'sesiones']).subscribe(d => { this.d = d; this.cargando = false; this.filtrar() })
  }
  filtrar() {
    const t = normalizar(this.texto)
    this.lista = this.d.estudiantes.filter(e => !t || normalizar(this.d.nombre(e.idUsuario)).includes(t))
  }
  sesiones(e: EstudianteDTO) { return this.d.sesiones.filter(s => s.idEstudiante === e.idEstudiante).length }
  eliminar(e: EstudianteDTO) {
    if (!confirm(`¿Eliminar el perfil de estudiante de ${this.d.nombre(e.idUsuario)}?`)) return
    this.eS.delete(e.idEstudiante).subscribe({
      next: () => { this.toast.ok('Estudiante eliminado'); this.cargar() },
      error: err => this.toast.http(err, 'No se pudo eliminar: tiene sesiones registradas'),
    })
  }
}
