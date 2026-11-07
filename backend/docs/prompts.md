# Prompts utilizados

## Prompt: revisión de historias de usuario

"Te paso mis historias de usuario, mis tareas y la estructura de carpetas de mi proyecto
(backend con Express + Sequelize, frontend con React + Vite). Revisa si las historias cubren
los requisitos del enunciado: login con sesión en cookie, roles usuario y técnico, listado de
equipos, formulario de incidencias, y la regla de que solo cierra una incidencia quien la
registró o un técnico. Dime qué falta, qué está mal y qué debería corregir."
**Decisión mía:** elegí SQLite y sesión con cookie. **Resultado:** estructura de carpetas y modelos.

## Prompt 2: error de ejecución del frontend
"npm error Missing script: "dev"... ¿qué archivos te paso?"
**Resultado:** la IA detectó que faltaba el `package.json` del frontend. Lo creé y corrió Vite.

## Prompt 3: revisión del código
Le pasé middlewares, rutas, modelos, seed y config del backend y el error de Vite
(`Failed to resolve import "./components/ListaIncidencias.jsx"`).
**Resultado:** encontró el nombre de archivo mal escrito, la falta de `revisarErrores`, el
prefijo `/api` inconsistente y el problema de `config.js` con las pruebas. Apliqué las correcciones.

## Prompt 4: error de login
Le pasé la captura de "Error 500" y `ECONNREFUSED` en `/auth/login`, y pregunté si la BD cumplía
el enunciado.
**Resultado:** me explicó que el backend no estaba corriendo y que había que levantar dos
terminales. Confirmó que los modelos cumplen el enunciado.