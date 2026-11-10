import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Ulistcomponent } from './ulistcomponent/ulistcomponent';

@Component({
  selector: 'app-usuariocomponent',
  imports: [RouterOutlet, Ulistcomponent],
  templateUrl: './usuariocomponent.html',
  styleUrl: './usuariocomponent.css',
})
export class Usuariocomponent {
  constructor(public route: ActivatedRoute) {}
}