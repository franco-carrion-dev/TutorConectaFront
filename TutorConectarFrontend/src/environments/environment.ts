// Producción: cambia "base" por la URL donde despliegues el backend (Render, Railway, etc.)
export const environment = {
  production: true,
  base: 'http://localhost:8080',
  // Culqi (sandbox): llave pública de prueba "pk_test_..." desde https://panel.culqi.com
  // Si la dejas vacía se usa el modo de pago simulado (sandbox interno)
  culqiPublicKey: '',
  jitsiDomain: 'meet.jit.si',
};
