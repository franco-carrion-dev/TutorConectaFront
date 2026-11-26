import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crudservice } from './crudservice';
import { DisponibilidadHorariaDTO } from '../models/DisponibilidadHorariaDTO';
import { HorasPorDiaDTO } from '../models/HorasPorDiaDTO';
import { HorasPorTutorDTO } from '../models/HorasPorTutorDTO';

@Injectable({ providedIn: 'root' })
export class Disponibilidadhorariaservice extends Crudservice<DisponibilidadHorariaDTO> {
  protected recurso = 'disponibilidades-horarias'
  listByTutor(idTutor: number): Observable<DisponibilidadHorariaDTO[]> {
    return this.lista(this.http.get<DisponibilidadHorariaDTO[]>(`${this.url}/tutor/${idTutor}`))
  }
  listByDia(dia: string): Observable<DisponibilidadHorariaDTO[]> {
    return this.lista(this.http.get<DisponibilidadHorariaDTO[]>(`${this.url}/dia/${encodeURIComponent(dia)}`))
  }
  reporteHorasPorDia(): Observable<HorasPorDiaDTO[]> {
    return this.http.get<HorasPorDiaDTO[]>(`${this.url}/reporte/horas-por-dia`)
  }
  reporteHorasPorTutor(): Observable<HorasPorTutorDTO[]> {
    return this.http.get<HorasPorTutorDTO[]>(`${this.url}/reporte/horas-por-tutor`)
  }
}
