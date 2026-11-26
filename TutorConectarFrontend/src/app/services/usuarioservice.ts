import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crudservice } from './crudservice';
import { UsuarioDTO } from '../models/UsuarioDTO';
import { UsuariosPorMesDTO } from '../models/UsuariosPorMesDTO';

@Injectable({ providedIn: 'root' })
export class Usuarioservice extends Crudservice<UsuarioDTO> {
  protected recurso = 'usuarios'
  me(): Observable<UsuarioDTO> { return this.http.get<UsuarioDTO>(`${this.url}/me`) }
  buscarTutoresPorNombre(nombre: string): Observable<UsuarioDTO[]> {
    return this.lista(this.http.get<UsuarioDTO[]>(`${this.url}/tutores/buscar`, { params: { nombre } }))
  }
  reporteRegistrosPorMes(anio: number): Observable<UsuariosPorMesDTO[]> {
    return this.http.get<UsuariosPorMesDTO[]>(`${this.url}/reporte/registros-por-mes`, { params: { anio } })
  }
  listByActivo(activo: boolean): Observable<UsuarioDTO[]> {
    return this.lista(this.http.get<UsuarioDTO[]>(`${this.url}/activo/${activo}`))
  }
}
