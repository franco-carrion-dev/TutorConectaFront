import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { MateriaDTO } from '../models/MateriaDTO';
import { Observable } from 'rxjs';
import { MateriaCantidadDTO } from '../models/MateriaCantidadDTO';

@Injectable({ providedIn: 'root' })
export class Materiaservice extends Crudservice<MateriaDTO> {
  protected recurso = 'materias'
  reporteSesionesPorMateria(): Observable<MateriaCantidadDTO[]> {
    return this.http.get<MateriaCantidadDTO[]>(`${this.url}/reporte/sesiones-por-materia`)
  }
  reporteTutoresPorMateria(): Observable<MateriaCantidadDTO[]> {
    return this.http.get<MateriaCantidadDTO[]>(`${this.url}/reporte/tutores-por-materia`)
  }
}
