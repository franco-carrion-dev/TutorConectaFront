import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crudservice } from './crudservice';
import { SesionDTO } from '../models/SesionDTO';
import { SesionesPorEstadoDTO } from '../models/SesionesPorEstadoDTO';

@Injectable({ providedIn: 'root' })
export class Sesionservice extends Crudservice<SesionDTO> {
  protected recurso = 'sesiones'
  cambiarEstado(id: number, estado: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/estado`, null, { params: { estado } })
  }
  reportePorEstado(): Observable<SesionesPorEstadoDTO[]> {
    return this.http.get<SesionesPorEstadoDTO[]>(`${this.url}/reporte/por-estado`)
  }
  listByRango(inicio: string, fin: string): Observable<SesionDTO[]> {
    return this.lista(this.http.get<SesionDTO[]>(`${this.url}/rango`, { params: { inicio, fin } }))
  }
}
