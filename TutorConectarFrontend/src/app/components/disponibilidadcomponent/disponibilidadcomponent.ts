import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-disponibilidadcomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './disponibilidadcomponent.html',
  styleUrl: './disponibilidadcomponent.css',
})
export class Disponibilidadcomponent {}