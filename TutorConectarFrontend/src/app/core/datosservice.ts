import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { Usuarioservice } from '../services/usuarioservice';
import { Tutorservice } from '../services/tutorservice';
import { Estudianteservice } from '../services/estudianteservice';
import { Materiaservice } from '../services/materiaservice';
import { Sesionservice } from '../services/sesionservice';
import { Pagoservice } from '../services/pagoservice';
import { Calificacionservice } from '../services/calificacionservice';
import { Disponibilidadhorariaservice } from '../services/disponibilidadhorariaservice';
import { Rolservice } from '../services/rolservice';
import { UsuarioDTO } from '../models/UsuarioDTO';
import { TutorDTO } from '../models/TutorDTO';
import { EstudianteDTO } from '../models/EstudianteDTO';
import { MateriaDTO } from '../models/MateriaDTO';
import { SesionDTO } from '../models/SesionDTO';
import { PagoDTO } from '../models/PagoDTO';
import { CalificacionDTO } from '../models/CalificacionDTO';
import { DisponibilidadHorariaDTO } from '../models/DisponibilidadHorariaDTO';
import { RolDTO } from '../models/RolDTO';

export type Parte = 'usuarios' | 'tutores' | 'estudiantes' | 'materias' | 'sesiones' | 'pagos'
  | 'calificaciones' | 'disponibilidades' | 'roles'

/** Snapshot de datos con búsquedas por id (para mostrar nombres en vez de ids) */
export class Datos {
  usuarios: UsuarioDTO[] = []
  tutores: TutorDTO[] = []
  estudiantes: EstudianteDTO[] = []
  materias: MateriaDTO[] = []
  sesiones: SesionDTO[] = []
  pagos: PagoDTO[] = []
  calificaciones: CalificacionDTO[] = []
  disponibilidades: DisponibilidadHorariaDTO[] = []
  roles: RolDTO[] = []

  usuario(id: number | null | undefined) { return this.usuarios.find(u => u.idUsuario === id) }
  nombre(idUsuario: number | null | undefined): string {
    const u = this.usuario(idUsuario)
    return u ? `${u.nombre} ${u.apellido}` : (idUsuario ? `#${idUsuario}` : '—')
  }
  tutor(id: number | null | undefined) { return this.tutores.find(t => t.idTutor === id) }
  materia(id: number | null | undefined) { return this.materias.find(m => m.idMateria === id) }
  nombreMateria(id: number | null | undefined): string { return this.materia(id)?.nombre ?? (id ? `#${id}` : '—') }
  sesion(id: number | null | undefined) { return this.sesiones.find(s => s.idSesion === id) }
  rol(id: number | null | undefined) { return this.roles.find(r => r.idRol === id) }
  nombreRol(id: number | null | undefined): string { return this.rol(id)?.denominacion ?? (id ? `#${id}` : '—') }

  /** Promedio real de calificaciones del tutor */
  promedio(idTutor: number): { prom: number, n: number } {
    const c = this.calificaciones.filter(x => x.idTutor === idTutor)
    return { prom: c.length ? c.reduce((a, b) => a + b.puntuacion, 0) / c.length : 0, n: c.length }
  }
  pagosDeSesion(idSesion: number) { return this.pagos.filter(p => p.idSesion === idSesion) }
  pagada(idSesion: number) { return this.pagosDeSesion(idSesion).some(p => p.estado === 'COMPLETADO') }
  calificada(idSesion: number) { return this.calificaciones.some(c => c.idSesion === idSesion) }
  horas(s: SesionDTO): number {
    return Math.max(0, (new Date(s.fechaFin).getTime() - new Date(s.fechaInicio).getTime()) / 3600000)
  }
}

@Injectable({ providedIn: 'root' })
export class Datosservice {
  private servicios: Record<Parte, { list(): Observable<any[]> }> = {
    usuarios: inject(Usuarioservice),
    tutores: inject(Tutorservice),
    estudiantes: inject(Estudianteservice),
    materias: inject(Materiaservice),
    sesiones: inject(Sesionservice),
    pagos: inject(Pagoservice),
    calificaciones: inject(Calificacionservice),
    disponibilidades: inject(Disponibilidadhorariaservice),
    roles: inject(Rolservice),
  }

  /** Carga en paralelo las colecciones pedidas; si alguna falla queda vacía */
  cargar(partes: Parte[]): Observable<Datos> {
    const pet: Record<string, Observable<any[]>> = {}
    partes.forEach(p => pet[p] = this.servicios[p].list().pipe(catchError(() => of([]))))
    return forkJoin(pet).pipe(map(r => Object.assign(new Datos(), r)))
  }
}
