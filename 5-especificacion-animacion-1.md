# Especificaciones de Animación

## Sistema de Distribución, Mayoreo y Streaming — Instantly Express

---

## Generalidades

**Estilo de animaciones:** Técnico y preciso, acorde al diseño "dashboard logístico tech" — movimientos rápidos, lineales o con leve `ease-out`, sin rebote orgánico. Se privilegia la sensación de velocidad y respuesta inmediata (feedback de tiempo real) sobre la sensación cálida/artesanal. Curvas de easing tipo `cubic-bezier(0.4, 0, 0.2, 1)` (estándar Material "standard easing") y `ease-out` para entradas.

**Alcance:** Estas especificaciones aplican tanto a la versión **Web** (React, con Framer Motion / CSS transitions) como a la versión **Móvil** (React Native, con Reanimated / Animated API). Las duraciones y curvas de easing son las mismas en ambas plataformas; lo que cambia son los disparadores de interacción (puntero vs. gestos táctiles) y el motor de mapas usado para animar el marcador de seguimiento.

**Tiempo de animaciones:**

- Micro-interacciones (botones, inputs): 100–180ms
- Transiciones de componentes (tarjetas, modales): 250–350ms
- Transiciones de página: 300–400ms
- Notificaciones: entrada 250ms, permanencia 5s, salida 200ms
- Actualización de marcador en mapa (posición simulada): transición continua de 2000ms (`ease-linear`) entre cada recálculo del backend, para que el movimiento se vea fluido y no "salte" de golpe

**Tipo de animaciones:**

- Fade (opacidad)
- Scale sutil (0.96 → 1)
- Slide (desplazamiento corto, 6–12px)
- Glow pulse (para elementos en vivo/tiempo real: pulso de resplandor neón repetido)
- Combinaciones fade + slide para entradas/salidas

---

## Efectos por elementos

| Elemento                     | Comportamiento                                                                                                       | Duracion                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Botones                          | Hover (Web): glow neón + escala 1.02. Click/Tap: escala 0.96 (efecto "presión")                                             | 120ms                            |
| Input: text                          | Focus: borde cambia a acento neón cian + glow sutil. Blur: regresa a estado normal                                             | 150ms                                |
| Página/Pantalla                        | Entrada: fade + slide vertical 8px hacia arriba. Salida: fade out                                                                  | 350ms                                    |
| Tarjeta de producto (catálogo)             | Hover (Web): elevación de sombra + glow del borde. Carga: fade-in escalonado (stagger 30ms entre ítems)                                | 200ms                                        |
| Badge de carrito (tab bar / ícono)             | Al agregar producto: pulso de escala 1 → 1.3 → 1 + glow neón momentáneo                                                                | 300ms                                            |
| Indicador de stock (carrito)                       | Cambio de color (verde/ámbar/rojo): transición de color suave, sin parpadeo. Si pasa a "insuficiente": pulso de glow rojo 2 veces  | 400ms (transición) / 600ms (pulso doble)             |
| Notificaciones                                        | Entrada: slide desde borde superior/derecho (Web) o superior (Móvil) + fade. Salida: fade + slide de regreso                          | Entrada 250ms / Salida 200ms                            |
| Modal                                                    | Entrada: fade del overlay + scale del contenido (0.96→1) + fade. Salida: inverso                                                        | 280ms                                                        |
| Marcador de mapa (seguimiento simulado)                     | Movimiento: transición continua e interpolada de posición (no salto instantáneo) cada vez que el backend emite `pedido:actualizado`. Pulso de glow cian continuo mientras el pedido está `en_transito` | 2000ms (movimiento) / loop 1500ms (pulso) |
| Barra de progreso (porcentaje de avance del pedido)             | Al recibir nuevo `porcentaje_avance`: la barra se rellena con transición suave, nunca salta hacia atrás                                    | 500ms                                                        |
| Fila de tabla de monitoreo en vivo (admin)                          | Entrada de nueva fila: highlight de fondo neón que se desvanece + slide-in leve desde arriba                                                  | 800ms (fade del highlight)                                     |
| Tarjetas de KPI                                                        | Entrada en lista: fade + slide vertical, stagger 30ms. Actualización de valor numérico: contador animado (count-up) al cambiar               | 250ms (entrada) / 400ms (count-up)                                |

## Reglas de animación

- Se ejecutarán las animaciones a la interacción con el puntero (click y hover) en Web, y con toques/gestos táctiles (tap, swipe, long-press) en Móvil.
- Las notificaciones desaparecen después de 5s o a través de click/tap en el botón de cerrar (X).
- Las animaciones se deben aplicar tanto a la entrada como a la salida de un elemento.
- **Ninguna animación relacionada con datos en tiempo real (mapa, stock, tabla de monitoreo) debe superar los 500ms de duración perceptible**, salvo el movimiento continuo del marcador de mapa (2000ms), ya que datos de monitoreo deben sentirse inmediatos, no decorativos.
- Los elementos que representan "en vivo" (badge de tiempo real, punto indicador de conexión WebSocket activa) usan un pulso de glow en loop continuo mientras dure la conexión activa, y se detiene (color apagado) si la conexión se pierde.

---

## Especificaciones para Web

**Disparadores:** puntero (mouse) y teclado.

- **Hover:** todo elemento interactivo (botones, tarjetas de producto, filas de tabla, íconos de acción) debe tener un estado hover distinguible mediante glow neón o elevación de sombra.
- **Focus visible (teclado):** al navegar con `Tab`, los elementos enfocados muestran un anillo/borde neón cian, con la misma transición de 150ms usada en inputs.
- **Tooltips:** aparecen tras 400ms de hover sostenido sobre íconos de acción, con fade-in de 120ms.
- **Transiciones de página:** al navegar entre secciones del sidebar, el contenido principal hace fade + slide vertical 8px (350ms); el sidebar y header permanecen estáticos.
- **Modales y drawers:** los modales centrados usan scale + fade (280ms); los paneles laterales (drawers) usan slide horizontal desde el borde derecho (300ms).
- **Mapa (Leaflet):** al abrir el mapa expandido, el modal hace scale + fade (280ms) y el mapa se centra automáticamente en la posición actual del marcador con una animación de `flyTo` de Leaflet (600ms).
- **Tabla de monitoreo en vivo:** las filas nuevas entran con highlight neón que se desvanece (800ms); no se anima el resto de la tabla para no distraer de los datos en tiempo real.
- **Scroll:** no se anima el scroll nativo del navegador; solo elementos que aparecen en viewport (ej. tarjetas de producto en catálogo) usan fade + slide de entrada con stagger 30ms.

---

## Especificaciones para Móvil

**Disparadores:** gestos táctiles (tap, swipe, long-press, pull-to-refresh).

- **Tap/Presión:** reemplaza el hover; todo elemento interactivo se escala a 0.96 al presionar y regresa a 1 al soltar (120ms).
- **Swipe en tarjetas de pedido:** al deslizar lateralmente para revelar la acción rápida ("Ver seguimiento"), el contenido se desplaza junto con el dedo y, al soltar, se ancla con transición de 180ms a la posición abierta o cerrada.
- **Pull-to-refresh:** ícono/spinner tipo radar o pulso de señal (acorde al tema tech) que rota o pulsa mientras el usuario mantiene el gesto, con fade-out de 200ms al completar.
- **Transiciones de pantalla (stack navigation):** al navegar hacia adelante, la nueva pantalla entra con slide horizontal desde la derecha + fade (350ms); al retroceder, se invierte.
- **Modales de pantalla completa:** los formularios entran con slide vertical desde abajo (300ms) y salen con slide hacia abajo.
- **Mapa (react-native-maps):** al expandir el mini-mapa a pantalla completa, transición de scale + fade (280ms); el marcador anima su movimiento de forma nativa mediante animación de coordenadas (`animateMarkerToCoordinate`, 2000ms) cada vez que llega una actualización por WebSocket.
- **Badge de carrito en tab bar:** pulso de escala + glow al agregar un producto (300ms), visible incluso si el usuario está en otra pestaña.
- **Tarjetas de KPI (carrusel):** el desplazamiento sigue el gesto de swipe 1:1 con el dedo; al soltar, se ajusta (snap) a la tarjeta más cercana con transición de 220ms.
- **Notificaciones push in-app:** entran con slide desde arriba + fade (250ms) y permanecen 5s antes de salir con fade + slide de regreso (200ms), ancladas a la parte superior de la pantalla.
