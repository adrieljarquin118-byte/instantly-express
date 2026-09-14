# Especificacion de validacion y pruebas

---

## Generalidades

_**Pruebas:** Manual y Automatizada_
_**Verificacion de procesos:** Automatico y Manual_
_**Verificacion de db:** MySQL_
_**Verificacion de tiempo real:** WebSockets (socket.io) y proceso programado de simulación de tracking_

## Tareas

1. Creación de script para la base de datos en MySQL (`SisInstantlyExpress`).
2. Montar toda la aplicación con las indicaciones en cada archivo de especificación (sistema general, datos, diseño, técnica, animación).
3. Revisar las funciones y que los datos puedan almacenarse correctamente en la base de datos, incluyendo los registros generados por el job de simulación de tracking.
4. Hacer una prueba rápida de cada uno de los puntos de conexión externos e internos, incluyendo los eventos WebSocket.
5. Establecer un respaldo cada X días de la base de datos.
6. Validar que el job programado de simulación de tracking (`node-cron`) se ejecute en el intervalo configurado sin duplicar actualizaciones ni saltarse pedidos activos.

## Revisión

- Mientras se ejecuta la revisión de funcionamiento, generar un reporte en PDF que contenga una lista de componentes (backend, frontend web, frontend móvil, WebSockets, job de tracking) y el estado en que se encuentran (activo, inactivo, en proceso).
- Inspeccionar la seguridad del login y verificar la seguridad del guardado de datos sensibles con encriptación JWT y hash de contraseñas (bcrypt).
- Cada uno de los endpoints, verificando su funcionamiento y casos que podrían fallar, con especial atención a:
  - `POST /api/carrito/agregar`: validar que rechace correctamente cantidades mayores al stock disponible y menores a la cantidad mínima de mayoreo (RS-06).
  - `PUT /api/pedidos/:id/estado`: validar que no permita saltos de estado inválidos (ej. de `pendiente` directo a `entregado`, ver RS-04).
  - `PUT /api/proveedores/:id/aprobar`: validar que un proveedor no aprobado no pueda publicar productos visibles públicamente (RS-05).
  - `GET /api/pedidos/:id/seguimiento`: validar que el porcentaje de avance nunca retroceda y que las coordenadas simuladas se mantengan dentro del rango esperado entre origen y destino.
- Ejecutar un test automatizado (Jest + Supertest), mostrando los puntos donde la información puede dañarse o causar fallos, incluyendo pruebas de concurrencia sobre `stock_disponible` (dos clientes agregando al carrito el mismo producto al mismo tiempo).
- Verificar que los eventos WebSocket (`carrito:actualizado`, `pedido:actualizado`, `monitoreo:evento_carrito`) lleguen únicamente a los usuarios/roles autorizados a recibirlos (un cliente no debe recibir eventos de monitoreo de otros clientes).

## Casos de prueba específicos del monitoreo de carrito

| # | Caso de prueba                                                                                     | Resultado esperado                                                                 |
| - | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1 | Agregar al carrito una cantidad mayor al `stock_disponible`                                                | Rechazo con mensaje de stock insuficiente; se registra evento en `log_monitoreo_carrito` |
| 2 | Agregar al carrito una cantidad menor a `cantidad_minima_mayoreo`                                             | Rechazo con mensaje de mayoreo mínimo no alcanzado                                          |
| 3 | Dos usuarios agregan al carrito simultáneamente las últimas unidades del mismo producto                          | Solo uno de los dos logra completar la reserva; el otro recibe `stock_insuficiente` actualizado |
| 4 | El stock cambia mientras un producto ya está en el carrito de otro cliente                                          | El cliente recibe el evento `carrito:actualizado` vía WebSocket sin recargar la página        |
| 5 | El admin abre el panel de Monitoreo de Carrito en Tiempo Real                                                          | La tabla se actualiza en vivo con cada nuevo evento, sin necesidad de refrescar                    |

## Casos de prueba específicos del tracking simulado

| # | Caso de prueba                                                                                     | Resultado esperado                                                                 |
| - | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1 | El job de simulación se ejecuta sobre un pedido en estado `confirmado`                                    | El estado avanza a `en_transito` y se crea el primer registro en `historial_seguimiento` |
| 2 | El tiempo transcurrido supera el `dias_estimados_max` del tipo de envío                                       | El `porcentaje_avance` se mantiene en 95% hasta confirmación manual, o pasa a `entregado` si la regla de auto-cierre está activa |
| 3 | Un pedido se marca como `cancelado` manualmente                                                                  | El job deja de procesar ese pedido y no genera más actualizaciones de posición simulada    |
| 4 | El cliente abre el detalle de un pedido en estado `pendiente`                                                      | Se muestra el placeholder "Esperando confirmación del proveedor", sin mini-mapa               |
| 5 | El admin abre el mapa de seguimiento múltiple con varios pedidos activos                                              | Todos los marcadores se muestran y se mueven de forma independiente según su propio progreso   |

## Reparación

- Hacer un reporte de los errores encontrados y las posibles soluciones.
- Establecer un nivel de prioridad para los arreglos o modificaciones que se deben realizar (crítico: afecta stock/pagos/seguridad; alto: afecta tracking o notificaciones; medio: afecta UI/UX; bajo: cosmético).
- Detener todos los servicios (backend, job de tracking, WebSockets) para revisar o modificar los cambios que sean necesarios, evitando aplicar cambios en caliente sobre la lógica de stock o de estados de pedido.
