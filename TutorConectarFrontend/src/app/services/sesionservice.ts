import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crudservice } from './crudservice';
import { SesionDTO } from '../models/SesionDTO';

@Injectable({ providedIn: 'root' })
export class Sesionservice extends Crudservice<SesionDTO> {
  protected recurso = 'sesiones'
  cambiarEstado(id: number, estado: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/estado`, null, { params: { estado } })
  }
}
