import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { TutorDTO } from '../models/TutorDTO';

@Injectable({ providedIn: 'root' })
export class Tutorservice extends Crudservice<TutorDTO> { protected recurso = 'tutores' }
