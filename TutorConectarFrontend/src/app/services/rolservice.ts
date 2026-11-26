import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { RolDTO } from '../models/RolDTO';
import { Observable } from 'rxjs';
import { UsuariosPorRolDTO } from '../models/UsuariosPorRolDTO';
import { PorcentajeRolDTO } from '../models/PorcentajeRolDTO';

@Injectable({ providedIn: 'root' })
export class Rolservice extends Crudservice<RolDTO> {
  protected recurso = 'roles'
  reporteUsuariosPorRol(): Observable<UsuariosPorRolDTO[]> {
    return this.http.get<UsuariosPorRolDTO[]>(`${this.url}/reporte/usuarios-por-rol`)
  }
  reportePorcentajePorRol(): Observable<PorcentajeRolDTO[]> {
    return this.http.get<PorcentajeRolDTO[]>(`${this.url}/reporte/porcentaje-por-rol`)
  }
}
