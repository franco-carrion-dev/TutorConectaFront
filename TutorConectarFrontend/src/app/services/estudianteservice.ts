import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { EstudianteDTO } from '../models/EstudianteDTO';

@Injectable({ providedIn: 'root' })
export class Estudianteservice extends Crudservice<EstudianteDTO> { protected recurso = 'estudiantes' }
