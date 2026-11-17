import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare const Culqi: any

/**
 * Culqi Checkout v4 (modo sandbox con llave pública pk_test_...).
 * Genera un token de tarjeta/Yape de prueba. Tarjeta de prueba: 4111 1111 1111 1111, CVV 123, fecha futura.
 */
@Injectable({ providedIn: 'root' })
export class Culqiservice {
  get habilitado(): boolean { return !!environment.culqiPublicKey }

  private cargarScript(): Promise<void> {
    if (typeof window === 'undefined') return Promise.reject()
    if ((window as any).Culqi) return Promise.resolve()
    return new Promise((ok, mal) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.culqi.com/js/v4'
      s.onload = () => ok()
      s.onerror = () => mal(new Error('No se pudo cargar Culqi'))
      document.body.appendChild(s)
    })
  }

  /** Abre el checkout y devuelve el id del token (tkn_test_...) */
  async pagar(titulo: string, montoSoles: number, email: string): Promise<string> {
    await this.cargarScript()
    Culqi.publicKey = environment.culqiPublicKey
    Culqi.settings({ title: 'TutorConecta', currency: 'PEN', amount: Math.round(montoSoles * 100), description: titulo })
    Culqi.options({ lang: 'auto', installments: false, paymentMethods: { tarjeta: true, yape: true }, style: { bannerColor: '#1D4ED8', buttonBackground: '#1D4ED8' } })
    return new Promise((ok, mal) => {
      (window as any).culqi = () => {
        if (Culqi.token) { const id = Culqi.token.id; Culqi.close(); ok(id) }
        else { Culqi.close(); mal(new Error(Culqi.error?.user_message ?? 'Pago no completado')) }
      }
      Culqi.open()
    })
  }
}
