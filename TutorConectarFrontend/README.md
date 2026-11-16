# TutorConecta – Frontend (Angular 21)

## Ejecutar
1. Levanta el backend (puerto 8080) con las variables de siempre (BD, `JWT_SECRET`, `JWT_EXPIRATION_MS`).
2. `npm install`
3. `ng serve` → http://localhost:4200
4. Entra con **admin@tutorconecta.com / admin123** (lo crea el backend al iniciar), o regístrate como estudiante o tutor.

La URL del backend está en `src/environments/environment*.ts` (`base`).

## Roles
- **Admin**: dashboard de reportes, CRUD de usuarios, roles, tutores (verificación de identidad), estudiantes,
  materias, disponibilidad, sesiones, pagos (resolver disputas), calificaciones y reportes de progreso.
- **Tutor**: panel (ingresos, rating), sesiones (unirse, marcar realizada), disponibilidad semanal,
  reportes de progreso y perfil (materias, tarifa, biografía).
- **Estudiante**: panel (historial y progreso por materia), búsqueda con filtros y recomendación IA,
  agenda con validación automática de disponibilidad, pago, videollamada, calificación y disputas.

## APIs
- **API REST propia (Spring Boot)** con JWT (interceptor) y guards por rol.
- **Jitsi Meet**: videollamada embebida (`/sala/:id`). meet.jit.si limita las llamadas embebidas a unos minutos;
  para clases largas usa “Abrir en otra pestaña”.
- **Culqi (sandbox)**: pon tu llave `pk_test_...` en `culqiPublicKey` del environment. Si la dejas vacía,
  se usa un pago de prueba interno (tarjeta 4111 1111 1111 1111 = aprobada, 4000… = rechazada, o Yape).
- **JavaMail**: lo envía el backend (ver `CAMBIOS_BACKEND.md`).

## Flujo de una sesión
`pendiente_pago` → (pago) → `agendada` → `realizada` | `cancelada`.
Si se cancela una sesión pagada, el pago pasa a `EN_DISPUTA` y el admin decide si se reembolsa.
