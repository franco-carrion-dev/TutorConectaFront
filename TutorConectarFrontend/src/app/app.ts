import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toastcomponent } from './shared/toastcomponent';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toastcomponent],
  template: `<router-outlet /><app-toast />`,
})
export class App {}
