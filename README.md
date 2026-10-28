# Taller de Spec-Driven Development (SDD)

## Aplicación Curso-PSWE-07

Aplicación de tareas con lista y detalle, filtros All/Pending/Done, formulario compartido
para crear/editar, cambio de estado y confirmación al eliminar. Guarda los datos en el
navegador y adapta la interfaz a móvil y escritorio.

Requiere Node.js 24 o posterior. La aplicación no tiene dependencias de ejecución ni requiere
compilación. Desde la carpeta del repositorio:

```sh
npm start
```

Abrir [http://127.0.0.1:4173](http://127.0.0.1:4173). Detener el servidor con Ctrl+C.
Si Node está instalado en Windows pero no figura en PATH:

```powershell
& 'C:\Program Files\nodejs\node.exe' scripts/serve.js
```

Usar siempre la misma dirección y perfil normal del navegador: cambiar de hostname, puerto,
protocolo o perfil separa el almacenamiento. Borrar los datos del navegador o terminar una
sesión privada elimina esa continuidad. No hay cuentas, respaldo ni sincronización.
Los fallos de almacenamiento se muestran sin reiniciar los datos; el formulario conserva
el borrador y permite reintentar Save después de corregir el acceso.

Para instalar las herramientas de desarrollo y ejecutar la verificación:

```sh
npm ci
npx playwright install chromium
npm run lint
npm test
```

Las pruebas usan Node y Chromium aislado de Playwright a 360px/1280px; la persistencia se
comprueba cerrando y reabriendo navegadores con perfiles temporales propios. No se usa el
perfil personal del usuario. El servidor de pruebas se inicia y detiene automáticamente.
En PowerShell, si npm tampoco está en PATH, añadirlo solo a la sesión:
`$env:Path = 'C:\Program Files\nodejs;' + $env:Path`.

Arquitectura: `src/ui` -> `src/logic` -> `src/persistence`. Solo persistencia accede al
almacenamiento y la interfaz del repositorio se sustituye por fakes en las pruebas unitarias.
La especificación y los resultados reales están en [specs/001-todo-app](specs/001-todo-app/).
El cierre de T039/T040 exige también las revisiones manuales de Firefox y Safari real
descritas en [quickstart.md](specs/001-todo-app/quickstart.md); Chromium no sustituye esas evidencias.

## Objetivo

Analizar y mejorar una especificación de requisitos elaborada con asistencia de inteligencia artificial.

El objetivo no es aceptar automáticamente lo que propone la IA, sino evaluar la calidad de los requisitos, identificar ambigüedades y justificar las decisiones de mejora.

## Caso de estudio

Una aplicación simple que gestiona tareas personales.

La especificación inicial se encuentra en `requirements/spec-inicial.md`.

## Actividades

1. Leer la especificación completa.
2. Identificar al menos tres ambigüedades, supuestos o decisiones pendientes.
3. Proponer mejoras a los criterios de aceptación.
4. Utilizar IA para explorar alternativas y evaluar críticamente sus propuestas.
5. Documentar las decisiones finales y justificarlas.

## Entregables

- Una especificación revisada.
- Al menos tres decisiones de mejora justificadas.
- Una reflexión breve sobre las limitaciones de utilizar IA para definir requisitos.

## Principio de trabajo

Cada cambio debe responder a una necesidad identificada y contar con una justificación.

No es necesario implementar la aplicación en este taller.

## Estructura del repositorio

- `requirements/`: especificación inicial.
- `activities/`: guía de trabajo.
- `deliverables/`: resultados de los estudiantes.
