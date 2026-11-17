import { Injectable } from '@angular/core';
import { Datos } from './datosservice';
import { TutorDTO } from '../models/TutorDTO';
import { mismoDia, minutos } from './fechas';

export interface Criterios {
  idMateria: number | null
  dia: string | null        // "Lunes"...
  hora: string | null       // "16:00"
  presupuesto: number | null
  idEstudiante: number | null
}

export interface Recomendacion {
  tutor: TutorDTO
  nombre: string
  puntaje: number           // 0-100
  rating: number
  resenas: number
  razones: string[]
  dictaMateria: boolean
}

/**
 * Motor de recomendación de tutores (funcionalidad de IA de la propuesta).
 * Modelo de puntuación ponderada que combina:
 *  - materia solicitada (filtro + afinidad por historial)          25%
 *  - disponibilidad horaria compatible                            25%
 *  - presupuesto declarado                                        20%
 *  - calificaciones, con más peso a sesiones previas similares    30%
 * Se recalcula en cada búsqueda y después de cada calificación (lee los datos actuales).
 */
@Injectable({ providedIn: 'root' })
export class Recomendadorservice {

  recomendar(d: Datos, c: Criterios, limite = 10): Recomendacion[] {
    const mediaGlobal = d.calificaciones.length
      ? d.calificaciones.reduce((a, b) => a + b.puntuacion, 0) / d.calificaciones.length : 3.5

    return d.tutores
      .filter(t => t.verificado)
      .filter(t => !c.idMateria || (t.idMaterias ?? []).includes(c.idMateria))
      .map(t => this.puntuar(d, t, c, mediaGlobal))
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, limite)
  }

  private puntuar(d: Datos, t: TutorDTO, c: Criterios, media: number): Recomendacion {
    const razones: string[] = []
    const sesionesTutor = d.sesiones.filter(s => s.idTutor === t.idTutor)

    // 1) Materia: dicta la materia + experiencia (sesiones realizadas de esa materia)
    let sMateria = 0.5
    const dicta = !!c.idMateria && (t.idMaterias ?? []).includes(c.idMateria)
    if (c.idMateria) {
      const realizadas = sesionesTutor.filter(s => s.idMateria === c.idMateria && s.estado === 'realizada').length
      sMateria = dicta ? Math.min(1, 0.6 + realizadas * 0.08) : 0
      if (dicta) razones.push(`Dicta ${d.nombreMateria(c.idMateria)}`)
      if (realizadas > 0) razones.push(`${realizadas} sesión(es) de esta materia`)
    }

    // 2) Disponibilidad
    const disp = d.disponibilidades.filter(x => x.idTutor === t.idTutor && x.disponible)
    let sDisp = disp.length ? 0.5 : 0
    if (c.dia) {
      const delDia = disp.filter(x => mismoDia(x.diaSemana, c.dia!))
      sDisp = delDia.length ? 0.6 : 0
      if (c.hora && delDia.some(x => minutos(x.horaInicio) <= minutos(c.hora!) && minutos(c.hora!) + 60 <= minutos(x.horaFin))) {
        sDisp = 1
        razones.push(`Libre el ${c.dia.toLowerCase()} a las ${c.hora}`)
      } else if (delDia.length) {
        razones.push(`Atiende los ${c.dia.toLowerCase()}`)
      }
    } else if (disp.length) {
      sDisp = Math.min(1, 0.5 + disp.length * 0.1)
      razones.push(`${disp.length} bloque(s) de horario`)
    }

    // 3) Presupuesto
    const tarifa = Number(t.tarifaPorHora) || 0
    let sPres = 0.5
    if (c.presupuesto && c.presupuesto > 0) {
      if (tarifa <= c.presupuesto) {
        sPres = 0.6 + 0.4 * (1 - tarifa / c.presupuesto)
        razones.push('Dentro de tu presupuesto')
      } else {
        sPres = Math.max(0, 0.4 * (1 - (tarifa - c.presupuesto) / c.presupuesto))
      }
    }

    // 4) Calificaciones (promedio bayesiano; sesiones de la misma materia pesan el doble)
    const cal = d.calificaciones.filter(x => x.idTutor === t.idTutor)
    let suma = 0, peso = 0
    cal.forEach(x => {
      const s = d.sesion(x.idSesion)
      const w = c.idMateria && s?.idMateria === c.idMateria ? 2 : 1
      suma += x.puntuacion * w; peso += w
    })
    const K = 3
    const bayes = (K * media + suma) / (K + peso)
    const sCal = bayes / 5
    const rating = cal.length ? cal.reduce((a, b) => a + b.puntuacion, 0) / cal.length : 0
    if (cal.length) razones.push(`★ ${rating.toFixed(1)} (${cal.length} reseña${cal.length > 1 ? 's' : ''})`)

    // Ya estudió con este tutor y lo calificó bien
    if (c.idEstudiante) {
      const propias = cal.filter(x => d.sesion(x.idSesion)?.idEstudiante === c.idEstudiante)
      if (propias.some(x => x.puntuacion >= 4)) razones.push('Te gustaron sus clases')
    }

    const puntaje = Math.round(100 * (0.25 * sMateria + 0.25 * sDisp + 0.20 * sPres + 0.30 * sCal))
    return {
      tutor: t, nombre: d.nombre(t.idUsuario), puntaje, rating, resenas: cal.length, razones, dictaMateria: dicta,
    }
  }
}
