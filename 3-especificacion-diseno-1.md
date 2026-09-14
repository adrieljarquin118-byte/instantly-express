# Especificaciones de Diseño (UI/UX)

## Sistema de Distribución, Mayoreo y Streaming — Instantly Express

## Generalidades

Estilo **"dashboard logístico tech"**: fondo oscuro, acentos neón, tipografía técnica, iconografía geométrica y filosa (no orgánica). Sensación de plataforma de monitoreo profesional en tiempo real — inspirado en centros de control logístico y apps de rastreo de envíos, con la densidad de información de un marketplace tipo Amazon en las pantallas de catálogo/carrito.

- Bordes moderados (8–12px) en tarjetas y botones — más angulares que redondeados, sin llegar a esquinas rectas.
- Efecto "glow" (resplandor neón sutil) en elementos activos, estados en vivo (`en_transito`) y botones primarios.
- Iconos de línea fina, geométricos, sin relleno salvo en estados activos.
- Microinteracciones rápidas y precisas (sin rebote orgánico), transmiten precisión y velocidad.
- El estilo visual (paleta, tipografía, bordes, iconografía) es **el mismo en Web y en Móvil**; lo que cambia entre plataformas es la disposición (layout), la navegación y el motor de mapas usado.

## Logo e identidad de marca

- Logo oficial: camión de reparto estilizado en navy oscuro (`#1B2E35`) con las iniciales "IE" en blanco hueso dentro de la carrocería, tres trazos horizontales (líneas de velocidad) a la izquierda, y el nombre "Instantly Express" debajo en tipografía serif editorial (ej. "Lora"/"Playfair Display"), también en navy oscuro.
- **El logo se usa siempre tal cual fue entregado**, sin recolorear a la paleta neón: navy oscuro sobre fondo claro (`#F2F5F9` o blanco), nunca sobre el fondo oscuro `#0B0E14` de la app salvo dentro de un contenedor claro propio (ej. una tarjeta blanca redondeada que envuelve el logo).
- Uso permitido: pantalla de Login/Registro (logo completo con nombre) y como ícono/isotipo reducido (solo el camión con "IE", sin el texto) en el header de Web y Móvil, ambos casos dentro de su propio contenedor de fondo claro para no perder contraste ni alterar los colores del logo.
- No aplicar el efecto "glow" neón ni animaciones de pulso sobre el logo; solo admite las animaciones estándar de entrada (fade/scale) descritas en la especificación de animación.

## Paleta de colores

- Fondo principal (base oscura): `#0B0E14`
- Fondo secundario (paneles/tarjetas): `#151A24`
- Fondo terciario (inputs, hover sutil): `#1E2530`
- Acento primario (neón cian — acciones, estado en tránsito): `#00E5FF`
- Acento secundario (neón naranja — alertas, CTA de compra): `#FF7A1A`
- Acento terciario (neón verde — entregado/éxito): `#39FF6A`
- Advertencia: `#FFC93C`
- Error: `#FF4757`
- Texto principal: `#F2F5F9`
- Texto secundario: `#8B93A7`
- Bordes/divisores: `#252C3A`

## Tipografía

- Encabezados: "Space Grotesk" o "Sora" (sans técnica geométrica) — 600/700
- Cuerpo/UI: "Inter" o "IBM Plex Sans" — 400/500
- Datos numéricos/monitoreo (precios, coordenadas, IDs de pedido): fuente monoespaciada "JetBrains Mono" o "Roboto Mono" — 500
- Escala Web: H1 30px, H2 24px, H3 18px, Body 15px, Caption 13px
- Escala Móvil: H1 24px, H2 20px, H3 17px, Body 14px, Caption 12px

## Tamaños de pantalla (responsive)

- Mobile: 320–599px → 1 columna, tab bar inferior
- Tablet: 600–1023px → 2 columnas, sidebar colapsable
- Desktop: 1024px+ → sidebar fija, contenido en grid 3–4 columnas (denso, tipo Amazon)
- Espaciado base: múltiplos de 4px

---

## Plataforma Web (Desktop / Tablet)

### Navegación

- Sidebar fija a la izquierda (240px) en desktop, colapsable a íconos (72px) en tablet, fondo `#151A24` con borde derecho `#252C3A`. Arriba del sidebar, isotipo reducido del logo (solo camión + "IE", sin el nombre) dentro de un pequeño contenedor claro circular o redondeado de 40x40px.
- Header superior con buscador global de productos, ícono de notificaciones con badge neón cian, avatar de usuario con menú desplegable, y **selector de rol activo** si el usuario tiene más de un contexto (ej. admin viendo como proveedor).
- Breadcrumbs debajo del header en pantallas internas (ej. Catálogo > Producto > Detalle).

### Layout

- Catálogo en grid de 3–4 columnas tipo marketplace (tarjeta de producto: imagen, nombre, proveedor, precio unitario, badge de cantidad mínima de mayoreo, botón "Agregar al carrito").
- Tarjetas de KPIs (pedidos activos, en tránsito, entregados hoy) en fila horizontal de 4 columnas en el dashboard.
- Tablas de datos completas (pedidos, productos, proveedores) con columnas visibles: imagen, nombre, proveedor, cantidad, estado, acciones.
- Modales centrados con overlay oscuro (opacidad 60%, ya que el fondo es oscuro se requiere mayor opacidad para contraste), ancho máximo 560px.
- Los formularios extensos (nuevo producto, solicitud de proveedor) se muestran en panel lateral deslizante (drawer) de 420px de ancho.

### Interacción

- Hover states con glow neón sutil en botones, tarjetas de producto y filas de tabla.
- Tooltips en íconos de acción tras 400ms de hover.
- Atajos de teclado: `Esc` cierra modales, `Enter` confirma formularios.
- Ordenamiento de columnas por click en encabezado de tabla.

---

## Plataforma Móvil (App)

### Navegación

- Tab bar inferior fija con 5 accesos: Inicio, Catálogo, Carrito, Pedidos, Perfil.
- Ícono de carrito en la tab bar muestra badge con cantidad de ítems y pulso neón breve al agregar un producto.
- Header superior simple: isotipo reducido del logo (contenedor claro circular 32x32px) + título de pantalla + ícono de notificaciones. Sin sidebar.
- Navegación entre pantallas internas mediante stack (push/pop) con botón de retroceso nativo.

### Layout

- Catálogo en grid de 2 columnas (tarjetas de producto compactas).
- Tarjetas de KPIs en carrusel horizontal deslizable (swipe) en el dashboard.
- Listados de pedidos en tarjetas apiladas verticalmente, con imagen del producto principal a la izquierda y estado/mini-mapa de progreso a la derecha.
- Formularios se muestran en pantalla completa (full-screen modal), con botón "Cerrar" (X) arriba y botón de acción primaria fijo abajo.
- Tablas de reportes se transforman en tarjetas resumidas con métricas clave; el detalle tabular completo queda disponible solo en Web.

### Interacción

- Sin hover; se usan estados de "presión" (`active`/`pressed`) con escala 0.97.
- Gestos: swipe horizontal en carruseles, swipe para refrescar listas (pull-to-refresh), swipe lateral en tarjetas de pedido para acción rápida ("Ver seguimiento").
- Notificaciones push nativas además de las notificaciones in-app.
- Áreas táctiles mínimas de 44x44px.
- Barra de búsqueda con acceso desde el header.

---

## Estructura de pantallas

```
─ Login / Registro
─ Inicio (Dashboard)
─ Catálogo
   └─ Detalle de producto
─ Carrito (con monitoreo de stock en tiempo real)
─ Pedidos
   └─ Detalle de pedido (mini-mapa de seguimiento)
─ Seguimiento en mapa (vista expandida)
─ Reportes
─ Panel de Proveedores (admin)
─ Monitoreo de Carrito en Tiempo Real (admin)
─ Perfil
```

Navegación: sidebar fija en desktop, tab bar en mobile con acceso directo al carrito.

## Pantalla: Login / Registro

**Web**

- Fondo `#0B0E14` con patrón de líneas de circuito/red sutil (opacidad 10%) decorando los laterales.
- Tarjeta central de ancho fijo (~420px), bordes 12px, fondo **claro** (`#F2F5F9`) exclusivamente en el bloque superior donde va el logo (contenedor propio redondeado, ver sección "Logo e identidad de marca"); el resto de la tarjeta (campos de formulario) mantiene el fondo oscuro `#151A24` con borde superior de línea de glow cian de 2px separando ambos bloques.
- Selector de tipo de cuenta al registrarse: "Cliente mayorista" o "Solicitar cuenta de Proveedor" (este último activa campos adicionales: nombre de empresa, país de origen, forma de pago preferida — queda en `estado_aprobacion = 'pendiente'`).

**Móvil**

- Mismo fondo y patrón, tarjeta ocupa ancho completo (márgenes 16px).
- Teclado nativo empuja el contenido sin recortar el logo.

**Común a ambas plataformas**

- Logo oficial completo (camión "IE" + nombre "Instantly Express") centrado arriba de la tarjeta, dentro de su contenedor claro; sin efecto glow ni recoloreo.
- Campos: correo, contraseña, checkbox "recordarme".
- Botón primario neón cian, texto `#0B0E14`.
- Link "¿Olvidaste tu contraseña?" en texto secundario.

### Pantalla: Inicio (Dashboard)

**Web**

- Header con saludo personalizado y avatar, integrado a la barra superior junto al buscador global.
- Tarjetas resumen (KPIs) en fila horizontal de 4 columnas: Pedidos activos, En tránsito, Entregados hoy, Alertas de stock.
- Sección "Pedidos en tránsito" con **mini-mapas resumen** (uno por pedido activo, tipo tarjeta con mapa embebido pequeño y estado de progreso), junto a panel lateral de accesos rápidos.
- Vista distinta según rol: cliente ve sus pedidos; proveedor ve pedidos de su catálogo y alertas de stock bajo; admin ve KPIs globales y accesos a aprobación de proveedores.

**Móvil**

- Header compacto con saludo y avatar pequeño.
- Tarjetas resumen (KPIs) en carrusel horizontal deslizable.
- Sección "Pedidos en tránsito" en tarjetas verticales, cada una con **mini-mapa resumen** (misma lógica que web, tamaño reducido) y barra de progreso con porcentaje.
- Accesos rápidos "Ver catálogo" y "Mis pedidos" como botones grandes de ancho completo.

### Pantalla: Catálogo

**Web**

- Barra de búsqueda + filtros (categoría, proveedor, rango de precio, tipo: producto físico/catálogo streaming/servicio) en una fila horizontal.
- Grid de tarjetas de producto de 3–4 columnas: imagen, nombre, proveedor, precio unitario, badge "Mín. mayoreo: X unidades", botón "Agregar al carrito".
- Al pasar el mouse sobre una tarjeta, se muestra overlay con vista rápida (quick view) y botón de agregar directo.

**Móvil**

- Barra de búsqueda fija arriba; filtros colapsados en bottom sheet.
- Grid de 2 columnas de tarjetas de producto compactas.
- Botón "Agregar al carrito" fijo en cada tarjeta (sin necesidad de quick view, ya que no hay hover).

### Pantalla: Carrito (con monitoreo de stock en tiempo real)

**Web**

- Listado de productos agregados en tabla/tarjetas: imagen, nombre, proveedor, cantidad (input numérico editable), subtotal.
- **Indicador de monitoreo en tiempo real** junto a cada línea: ícono de estado (verde = stock confirmado disponible, ámbar = stock bajo/últimas unidades, rojo = stock insuficiente — bloquea el checkout) que se actualiza vía WebSocket sin recargar la página.
- Si la cantidad ingresada es menor a `cantidad_minima_mayoreo`, se muestra advertencia inline junto al campo.
- Panel lateral fijo con resumen: subtotal, tipo de envío (selector), total, botón "Confirmar pedido".

**Móvil**

- Listado de productos en tarjetas apiladas, mismo indicador de estado de stock por color, actualizado en tiempo real.
- Selector de tipo de envío y resumen de totales en panel inferior fijo (sticky) sobre la tab bar.
- Botón "Confirmar pedido" de ancho completo, fijo en la parte inferior.

**Común a ambas plataformas**

- Si el stock cambia mientras el producto está en el carrito (otro cliente compró las últimas unidades), se muestra una notificación toast inmediata indicando la nueva cantidad disponible.

### Pantalla: Pedidos → Detalle de pedido (mini-mapa de seguimiento)

**Web**

- Encabezado con número de pedido, estado actual (chip de color: gris=pendiente, cian=confirmado, ámbar=en_transito, verde=entregado, rojo=cancelado), fecha estimada de entrega.
- **Mini-mapa embebido** (Leaflet) mostrando la posición simulada actual del envío entre origen (proveedor) y destino (dirección de entrega), con línea de ruta punteada neón cian.
- Botón "Expandir mapa" sobre el mini-mapa, que abre el mapa a pantalla completa (modal) con zoom interactivo, marcador animado y línea de tiempo del `historial_seguimiento` debajo del mapa.
- Línea de tiempo (timeline) vertical con cada evento de `historial_seguimiento`: ícono, descripción, fecha/hora.
- Listado de productos del pedido con detalle de proveedor y cantidad.

**Móvil**

- Mismo encabezado con chip de estado.
- Mini-mapa embebido (`react-native-maps`) del mismo tamaño reducido; tap sobre el mapa lo expande a pantalla completa.
- Vista expandida en pantalla completa: mapa grande, marcador animado, timeline de eventos debajo en scroll.
- Listado de productos del pedido en tarjetas.

**Común a ambas plataformas**

- El mini-mapa solo se muestra si el pedido está en estado `confirmado` o `en_transito`; en `pendiente` se muestra un placeholder ilustrado "Esperando confirmación del proveedor"; en `entregado` se muestra el mapa congelado en el destino con ícono de check.

### Pantalla: Seguimiento en mapa (vista expandida — proveedor/admin)

**Web**

- Vista de mapa completa con **múltiples pedidos activos simultáneos** (todos los del proveedor, o todos los del sistema si es admin), cada uno como marcador con color según estado.
- Panel lateral con lista filtrable de pedidos activos; al seleccionar uno, el mapa hace zoom a su ruta.
- Actualización en tiempo real vía WebSocket (los marcadores se mueven suavemente conforme el backend recalcula `latitud_simulada`/`longitud_simulada`).

**Móvil**

- Misma vista de mapa múltiple, con lista de pedidos en bottom sheet deslizable desde abajo (colapsable) en vez de panel lateral fijo.

### Pantalla: Monitoreo de Carrito en Tiempo Real (admin)

**Web**

- Tabla en vivo (auto-actualizada vía WebSocket) de `log_monitoreo_carrito`: usuario, producto, acción (agregado/modificado/eliminado/stock insuficiente), cantidad solicitada, stock en el momento, fecha/hora — las filas más recientes entran con highlight breve de fondo neón que se desvanece.
- Filtros por producto, por tipo de acción, y por proveedor.
- Tarjetas de KPI arriba: total de eventos hoy, eventos de "stock insuficiente" (alerta), producto más agregado al carrito en la última hora.
- Gráfico de línea en tiempo real (últimos 60 minutos) de actividad de carrito.

**Móvil**

- Misma tabla en vivo transformada en lista de tarjetas compactas (usuario, producto, acción con ícono de color, hace cuánto tiempo).
- KPIs en carrusel horizontal arriba.
- Gráfico simplificado o solo el dato numérico total, sin el gráfico de línea (queda disponible solo en Web).

### Pantalla: Reportes

**Web**

- Selector de rango de fechas y tipo de reporte (ventas por proveedor, productos más pedidos, tiempos promedio de entrega, stock bajo) en barra horizontal.
- Gráficos de barras (cian/naranja) con leyenda clara, en grid junto a tablas de detalle completas.
- Exportación a PDF/Excel mediante botón en la barra de acciones.

**Móvil**

- Selector de rango de fechas y tipo de reporte mediante bottom sheet.
- Gráficos de barras simplificados, sin tablas de detalle completas — solo tarjetas resumidas con métricas clave.
- Exportación disponible mediante botón que dispara el menú nativo de compartir.
