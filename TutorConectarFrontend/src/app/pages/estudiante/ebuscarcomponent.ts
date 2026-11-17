import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { Recomendacion, Recomendadorservice } from '../../core/recomendadorservice';
import { DIAS, NIVELES } from '../../models/Constantes';
import { mismoDia, minutos, normalizar } from '../../core/fechas';
import { EstrellasPipe, InicialesPipe } from '../../shared/pipes';

/** Buscar y filtrar tutores por materia, precio, calificación y horario + recomendaciones IA */
@Component({
  selector: 'app-ebuscar',
  imports: [FormsModule, RouterLink, CurrencyPipe, DecimalPipe, EstrellasPipe, InicialesPipe],
  templateUrl: './ebuscarcomponent.html',
  styleUrl: './ebuscarcomponent.css',
})
export class Ebuscarcomponent implements OnInit {
  private dS = inject(Datosservice)
  private rec = inject(Recomendadorservice)
  private auth = inject(Loginservice)
  d = new Datos()
  dias = DIAS
  niveles = NIVELES
  cargando = true

  texto = ''
  idMateria: number | null = null
  nivel = ''
  precioMax: number | null = null
  ratingMin = 0
  dia = ''
  hora = ''
  orden: 'ia' | 'precio' | 'rating' = 'ia'
  resultados: Recomendacion[] = []

  ngOnInit() {
    this.dS.cargar(['tutores', 'usuarios', 'materias', 'disponibilidades', 'calificaciones', 'sesiones', 'estudiantes']).subscribe(d => {
      this.d = d
      this.precioMax = d.estudiantes.find(e => e.idEstudiante === this.auth.id())?.presupuestoMaximo ?? null
      this.cargando = false
      this.buscar()
    })
  }

  materiasFiltradas() { return this.d.materias.filter(m => !this.nivel || m.nivelEducativo === this.nivel) }

  /** Se recalcula en cada búsqueda */
  buscar() {
    const base = this.rec.recomendar(this.d, {
      idMateria: this.idMateria, dia: this.dia || null, hora: this.hora || null,
      presupuesto: this.precioMax, idEstudiante: this.auth.id(),
    }, 100)
    const t = normalizar(this.texto)
    const idsNivel = this.nivel ? new Set(this.materiasFiltradas().map(m => m.idMateria)) : null
    this.resultados = base.filter(r =>
      (!t || normalizar(r.nombre).includes(t)) &&
      (!idsNivel || r.tutor.idMaterias.some(id => idsNivel.has(id))) &&
      (!this.precioMax || Number(r.tutor.tarifaPorHora) <= this.precioMax) &&
      (!this.ratingMin || r.rating >= this.ratingMin) &&
      (!this.dia || this.d.disponibilidades.some(x => x.idTutor === r.tutor.idTutor && x.disponible && mismoDia(x.diaSemana, this.dia)
        && (!this.hora || (minutos(x.horaInicio) <= minutos(this.hora) && minutos(this.hora) + 60 <= minutos(x.horaFin)))))
    )
    if (this.orden === 'precio') this.resultados.sort((a, b) => a.tutor.tarifaPorHora - b.tutor.tarifaPorHora)
    if (this.orden === 'rating') this.resultados.sort((a, b) => b.rating - a.rating || b.resenas - a.resenas)
  }

  limpiar() {
    this.texto = ''; this.idMateria = null; this.nivel = ''; this.ratingMin = 0; this.dia = ''; this.hora = ''
    this.precioMax = null; this.buscar()
  }
  materiasDe(r: Recomendacion) { return r.tutor.idMaterias.map(id => this.d.nombreMateria(id)) }
}
