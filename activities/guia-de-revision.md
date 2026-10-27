# Actividad: auditoría de requisitos generados con IA

## Objetivo

Evaluar la calidad de una especificación de requisitos e identificar decisiones que requieren aclaración, validación o una mejor justificación.

## Instrucciones

Lea `requirements/spec-inicial.md` antes de responder.

No se trata de encontrar errores por encontrar errores. Cada observación debe explicar por qué una decisión importa para el usuario, el equipo de desarrollo o la validación del producto.

### 1. Identificar hallazgos

Identifique al menos tres hallazgos. Pueden ser:

- Un requisito ambiguo.
- Un supuesto que la IA introdujo sin confirmación del usuario.
- Un criterio de aceptación difícil de verificar.
- Un comportamiento que no se ha definido.
- Una regla que podría generar resultados inesperados.

Para cada hallazgo, documente:

1. Fragmento de la especificación.
2. Problema identificado.
3. Posible consecuencia.
4. Propuesta de mejora.
5. Justificación de la propuesta.

### 2. Evaluar decisiones concretas

Analice estas situaciones:

**Caso A. Guardado de tareas**

La especificación indica que las tareas deben conservarse cuando se cierra y abre la aplicación. ¿Es suficiente para definir cuándo se considera guardada una tarea?

**Caso B. Eliminación**

La aplicación permite eliminar tareas. ¿Qué debería ocurrir antes y después de eliminar una tarea? ¿Qué alternativas existen y qué consecuencias tiene cada una?

**Caso C. Filtros**

El usuario visualiza únicamente tareas pendientes y marca una como completada. ¿Debe desaparecer inmediatamente de la lista? ¿Qué comportamiento esperaría el usuario?

**Caso D. Medición del éxito**

La especificación establece que el 90 % de los usuarios debería completar ciertas tareas en un tiempo determinado. ¿Qué información adicional se necesita para comprobar ese resultado de forma fiable?

### 3. Contrastar con IA

Solicite a una herramienta de IA que proponga mejoras para uno de sus hallazgos.

Después, evalúe la respuesta:

- ¿Resuelve el problema identificado?
- ¿Introduce nuevas decisiones que no fueron solicitadas?
- ¿Se puede verificar la propuesta?
- ¿Qué información adicional necesitaría del usuario?

No acepte una propuesta solo porque esté bien redactada.

### 4. Documentar la decisión final

Seleccione al menos tres mejoras y explique por qué las acepta, modifica o rechaza.

Si una decisión requiere consultar al usuario, indíquelo explícitamente en lugar de inventar una respuesta.

## Resultado esperado

Una especificación mejorada y un registro de decisiones que permita comprender no solo qué cambió, sino también por qué.