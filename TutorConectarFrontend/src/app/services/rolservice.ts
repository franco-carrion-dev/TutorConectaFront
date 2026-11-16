import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { RolDTO } from '../models/RolDTO';

@Injectable({ providedIn: 'root' })
export class Rolservice extends Crudservice<RolDTO> { protected recurso = 'roles' }
