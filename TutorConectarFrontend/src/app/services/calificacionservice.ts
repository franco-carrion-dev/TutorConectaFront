import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { CalificacionDTO } from '../models/CalificacionDTO';

@Injectable({ providedIn: 'root' })
export class Calificacionservice extends Crudservice<CalificacionDTO> { protected recurso = 'calificaciones' }
