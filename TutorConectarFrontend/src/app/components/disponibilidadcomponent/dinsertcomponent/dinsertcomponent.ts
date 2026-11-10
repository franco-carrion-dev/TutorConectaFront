import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DisponibilidadHorariaDTO } from '../../../models/DisponibilidadHorariaDTO';
import { Disponibilidadhorariaservice } from '../../../services/disponibilidadhorariaservice';

@Component({
  selector: 'app-dinsertcomponent',
  imports: [ReactiveFormsModule],
  templateUrl: './dinsertcomponent.html',
  styleUrl: './dinsertcomponent.css',
})
export class Dinsertcomponent {
  form: FormGroup
  mensaje: string = ''

  constructor(private fb: FormBuilder, private dS: Disponibilidadhorariaservice, private router: Router) {
    this.form = this.fb.group({
      idTutor: [null, Validators.required],
      diaSemana: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
    })
  }

  guardar() {
    if (this.form.invalid) { this.mensaje = 'Completa todos los campos'; return }
    const d: DisponibilidadHorariaDTO = this.form.value
    if (d.horaFin <= d.horaInicio) { this.mensaje = 'La hora de fin debe ser mayor a la de inicio'; return }
    this.dS.insert(d).subscribe({
      next: () => this.router.navigate(['/disponibilidades']),
      error: () => { this.mensaje = 'No se pudo registrar' }
    })
  }
}