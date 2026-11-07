# Decisiones del proyecto

## 1. Qué entendí del problema y qué tablas/modelos planeé

Entendí que el laboratorio necesita registrar fallas de equipos y que lo importante no es solo
guardar datos, sino controlar quién puede cerrar una incidencia. Hay dos roles: `usuario`
(reporta) y `tecnico` (repara). La regla: solo cierra la incidencia quien la registró o un técnico,
y eso debe verificarse en el **backend**, porque ocultar un botón en React no es seguridad.

Modelos (Sequelize + SQLite):

| Modelo | Campos | Relaciones |
|---|---|---|
| Usuario | nombre, email (único), passwordHash, rol | tiene muchas Incidencias |
| Equipo | codigo (único), nombre, ubicacion | tiene muchas Incidencias |
| Incidencia | descripcion, estado (abierta/cerrada), cerradaEn | pertenece a Equipo, a quien la registró (usuarioId) y a quien la cerró (cerradaPorId) |

Elegí SQLite porque no quise instalar un servidor de base de datos y el enunciado deja la BD a
elección.

La sesión usa `express-session` con cookie `httpOnly`; guarda `usuarioId` y `rol`. El endpoint
`PATCH /incidencias/:id/cerrar` responde 404 si no existe, 403 si no tiene permiso y 409 si ya
estaba cerrada. El usuario de una incidencia sale de la sesión, nunca del body.

## 2. Qué partes se delegaron a la IA y por qué

Usé a Claude como apoyo. Yo le di el como unas historias de usuario para que me ayudara a ver si estaba bien, mis tareas y mi estructura de carpetas, y le pedí que las revisara.

**Delegué:** la estructura inicial del backend, las rutas, los componentes de React y el
borrador de las pruebas, porque es trabajo repetitivo y me ayudaba a avanzar rápido.

**No delegué a ciegas:** la regla de cierre y la sesión por roles, porque son lo central del
ejercicio. Las leí para poder explicarlas. También decidí yo SQLite, cookies de sesión y los
datos de prueba del seed (usuarios y equipos).

## 3. Qué hizo mal la IA o tuve que corregir, y cómo me di cuenta

Al correr el proyecto aparecieron varios fallos que la IA no había previsto:

1. **Faltaba `revisarErrores` en `middlewares/errores.js`.** Las rutas lo importaban pero el
   archivo solo exportaba `manejadorErrores`. Me di cuenta porque el backend no arrancaba.
   Lo corregí agregando la función con `validationResult`.
2. **Rutas inconsistentes entre frontend y backend.** El proxy de Vite apuntaba a `/api`, pero el
   backend montaba `/auth`, `/equipos`, `/incidencias`. Lo vi en la terminal:
   `http proxy error: /auth/login`. Lo corregí [con el prefijo `/api` / ajustando el proxy].
3. **`frontend/package.json` no existía**, así que `npm run dev` fallaba con "Missing script".


Limitaciones que conozco: uso `sequelize.sync()` en vez de migraciones, el `MemoryStore` pierde
las sesiones al reiniciar, y `secure: false` en la cookie solo sirve en desarrollo (en producción
usaría HTTPS).