import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Loginservice } from '../core/loginservice';

/** Redirige al panel según el rol */
@Component({ selector: 'app-inicio', template: '' })
export class Iniciocomponent implements OnInit {
  private auth = inject(Loginservice)
  private router = inject(Router)
  ngOnInit() { this.router.navigateByUrl(this.auth.inicio(), { replaceUrl: true }) }
}
