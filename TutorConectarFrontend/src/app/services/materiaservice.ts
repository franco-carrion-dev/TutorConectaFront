import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { MateriaDTO } from '../models/MateriaDTO';

@Injectable({ providedIn: 'root' })
export class Materiaservice extends Crudservice<MateriaDTO> { protected recurso = 'materias' }
