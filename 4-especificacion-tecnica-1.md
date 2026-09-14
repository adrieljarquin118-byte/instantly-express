# Especificacion Tecnica

---

## Generalidades

_**Lenguajes de programacion:**_

- **Frontend Web:** React + Vite + React Router
- **Frontend APK:** React Native + Expo
- **Backend:** NodeJS, Express, MySQL2
- **DB:** MySQL
- **Tiempo real:** Socket.io (servidor y cliente)
- **Mapas Web:** Leaflet + react-leaflet + tiles de OpenStreetMap
- **Mapas Móvil:** react-native-maps (proveedor por defecto; sin API key de Google Maps requerida si se usa el proveedor por defecto en iOS, y con API key de Google en Android)

## Simulación de tracking (motor de seguimiento)

Dado que el tracking es **simulado/estimado** (sin GPS real de repartidor), el backend ejecuta un proceso programado que:

1. Cada X minutos (configurable, ej. cada 2 minutos, vía `node-cron`), recorre todos los pedidos con estado `confirmado` o `en_transito`.
2. Calcula el tiempo transcurrido desde `fecha_pedido` contra el rango `dias_estimados_min`/`dias_estimados_max` del `tipo_envio` asociado.
3. Recalcula `porcentaje_avance` de forma proporcional al tiempo transcurrido (nunca retrocede, y se limita a 95% hasta que un `bibliotecario`/proveedor marque `entregado` manualmente o el sistema lo marque automático al llegar al 100% del tiempo estimado).
4. Interpola linealmente `latitud_simulada`/`longitud_simulada` entre las coordenadas del proveedor (origen) y la `direccion_envio` (destino) según el `porcentaje_avance`.
5. Si el `porcentaje_avance` cruza un umbral relevante (25%, 50%, 75%, 100%), inserta un registro en `historial_seguimiento` con una descripción generada (ej. "Tu pedido va en camino, 50% del trayecto estimado completado").
6. Emite el evento WebSocket `pedido:actualizado` con el nuevo estado/posición a los clientes suscritos (cliente dueño del pedido, proveedor, y admins conectados al panel de monitoreo de mapas).

**Nota:** Este motor es una simulación de negocio, no un cálculo geoespacial real de tránsito; las coordenadas interpoladas no consideran rutas viales reales, solo una línea recta entre origen y destino, suficiente para representar visualmente el avance en el mapa.

## WebSockets — eventos

| Evento                     | Emisor      | Receptor(es)                              | Payload                                                       |
| ---------------------------- | ------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| `carrito:actualizado`            | Backend       | Cliente dueño del carrito                        | `{ id_producto, stock_disponible, accion }`                          |
| `carrito:stock_insuficiente`         | Backend        | Cliente dueño del carrito                           | `{ id_producto, cantidad_solicitada, stock_disponible }`                 |
| `pedido:actualizado`                    | Backend         | Cliente dueño del pedido, proveedor, admins conectados | `{ id_pedido, estado, porcentaje_avance, latitud_simulada, longitud_simulada }` |
| `monitoreo:evento_carrito`                  | Backend          | Admins conectados al panel de monitoreo                   | Fila completa de `log_monitoreo_carrito`                                          |

## Endpoints (backend Express)

Base: `/api`. Todos los endpoints de escritura requieren JWT; el rol requerido se indica en la tabla (RS-05).

| Método | Ruta                                                       | Descripción                                                        | Archivo                       | Rol requerido                     |
| ------ | ------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------- | ---------------------------------- |
| POST   | `/api/auth/login`                                                | Autenticación, devuelve JWT                                               | `routes/auth.js`                  | público                             |
| POST   | `/api/auth/registro`                                                | Registro de cliente o solicitud de proveedor                                 | `routes/auth.js`                     | público                             |
| GET    | `/api/productos`                                                       | Catálogo completo                                                                 | `routes/productos.js`                   | público (lectura)                    |
| GET    | `/api/productos?busqueda=&categoria=&proveedor=`                          | Buscar/filtrar catálogo                                                               | `routes/productos.js`                       | público                              |
| GET    | `/api/productos/:id`                                                          | Detalle de un producto                                                                    | `routes/productos.js`                           | público                               |
| POST   | `/api/productos`                                                                  | Registrar producto                                                                            | `routes/productos.js`                               | proveedor (propio) / admin              |
| PUT    | `/api/productos/:id`                                                                  | Modificar producto                                                                                 | `routes/productos.js`                                   | proveedor (propio) / admin                  |
| DELETE | `/api/productos/:id`                                                                      | Eliminar producto                                                                                        | `routes/productos.js`                                       | proveedor (propio) / admin                      |
| GET    | `/api/carrito`                                                                                | Ver carrito del usuario autenticado                                                                             | `routes/carrito.js`                                              | cliente autenticado                                 |
| POST   | `/api/carrito/agregar`                                                                            | Agregar producto al carrito (**valida stock en tiempo real**, RS-06)                                                  | `routes/carrito.js`                                                  | cliente autenticado                                     |
| PUT    | `/api/carrito/:id_detalle`                                                                            | Modificar cantidad de un producto en el carrito                                                                            | `routes/carrito.js`                                                      | cliente autenticado                                         |
| DELETE | `/api/carrito/:id_detalle`                                                                                | Eliminar producto del carrito                                                                                                  | `routes/carrito.js`                                                          | cliente autenticado                                             |
| GET    | `/api/monitoreo/carrito`                                                                                      | Listar eventos de `log_monitoreo_carrito` en tiempo real                                                                            | `routes/monitoreo.js`                                                            | admin                                                             |
| POST   | `/api/pedidos`                                                                                                    | Confirmar pedido a partir del carrito                                                                                                    | `routes/pedidos.js`                                                                  | cliente autenticado                                                   |
| GET    | `/api/pedidos`                                                                                                        | Listar pedidos (propios si es cliente/proveedor, todos si es admin)                                                                            | `routes/pedidos.js`                                                                      | autenticado                                                               |
| GET    | `/api/pedidos/:id`                                                                                                        | Detalle de un pedido                                                                                                                            | `routes/pedidos.js`                                                                          | dueño del recurso / proveedor / admin                                          |
| PUT    | `/api/pedidos/:id/estado`                                                                                                     | Actualizar estado manual del pedido (ej. marcar entregado, cancelar)                                                                                | `routes/pedidos.js`                                                                              | proveedor / admin                                                                  |
| GET    | `/api/pedidos/:id/seguimiento`                                                                                                    | Obtener estado actual de `seguimiento_pedidos` + `historial_seguimiento`                                                                                | `routes/seguimiento.js`                                                                              | dueño del recurso / proveedor / admin                                                  |
| GET    | `/api/seguimiento/activos`                                                                                                            | Listar todos los pedidos activos con posición simulada (para mapa múltiple)                                                                            | `routes/seguimiento.js`                                                                                  | proveedor (propios) / admin                                                            |
| GET    | `/api/proveedores`                                                                                                                        | Listar proveedores                                                                                                                                        | `routes/proveedores.js`                                                                                      | admin                                                                                      |
| PUT    | `/api/proveedores/:id/aprobar`                                                                                                                | Aprobar/rechazar solicitud de proveedor (RS-05)                                                                                                                | `routes/proveedores.js`                                                                                          | admin                                                                                        |
| GET    | `/api/reportes?tipo=ventas\|productos_top\|tiempos_entrega\|stock_bajo`                                                                            | Reporte agregado                                                                                                                                                    | `routes/reportes.js`                                                                                                | proveedor (propio) / admin                                                                       |
| GET    | `/api/resenas?id_producto=`                                                                                                                            | Ver reseñas de un producto                                                                                                                                              | `routes/resenas.js`                                                                                                    | público                                                                                            |
| POST   | `/api/resenas`                                                                                                                                              | Registrar reseña                                                                                                                                                            | `routes/resenas.js`                                                                                                        | cliente autenticado                                                                                       |
| GET    | `/api/notificaciones`                                                                                                                                            | Notificaciones del usuario autenticado                                                                                                                                          | `routes/notificaciones.js`                                                                                                    | autenticado                                                                                                  |
| GET    | `/api/direcciones`                                                                                                                                                    | Listar direcciones de envío del usuario                                                                                                                                              | `routes/direcciones.js`                                                                                                            | cliente autenticado                                                                                                |
| POST   | `/api/direcciones`                                                                                                                                                        | Registrar dirección de envío                                                                                                                                                              | `routes/direcciones.js`                                                                                                                | cliente autenticado                                                                                                    |
| GET    | `/api/tipos-envio`                                                                                                                                                            | Catálogo de tipos de envío disponibles                                                                                                                                                          | `routes/tiposEnvio.js`                                                                                                                    | público                                                                                                                    |

## Estructura de carpetas

```
instantlyexpress/
├── backend/
│   ├── config/            (conexión mysql2, variables de entorno, config de socket.io)
│   ├── middleware/         (auth JWT, autorización por rol, validación de stock en tiempo real)
│   ├── routes/             (un archivo por recurso, según tabla de endpoints)
│   ├── controllers/
│   ├── models/
│   ├── jobs/                (proceso programado de simulación de tracking, node-cron)
│   ├── sockets/               (definición de eventos de socket.io)
│   ├── tests/                 (Jest + Supertest)
│   └── database/
│       └── script.sql        (DDL completo — ya generado, ver /database/script.sql en este mismo paquete de entrega)
│
├── shared/
│   ├── assets/
│   │   └── logo-instantly-express.png   (logo oficial, exportado en @1x/@2x/@3x; ver especificación de diseño)
│   ├── theme.js               (colores y tipografía de la sección de diseño, importado por web y APK)
│   ├── services/               (funciones de llamada a la API con axios, reutilizadas por ambos)
│   ├── socketClient.js          (cliente de socket.io compartido, conexión y suscripción a eventos)
│   ├── simulacionTracking.js       (funciones puras de interpolación de progreso, usadas para previsualización optimista en frontend)
│   └── validaciones.js              (reglas de negocio puras: mayoreo mínimo, stock, DUI/NIT de proveedor)
│
├── web/                       (React + Vite)
│   └── src/
│       ├── pages/               (Login, Inicio, Catalogo, DetalleProducto, Carrito, Pedidos, DetallePedido, SeguimientoMapa, MonitoreoCarrito, Reportes, PanelProveedores, Perfil)
│       ├── components/            (incluye MiniMapaSeguimiento, MapaExpandido, TarjetaProducto, TablaMonitoreoEnVivo)
│       └── styles/                 (CSS/Tailwind, breakpoints 480p/720p/1024p)
│
└── mobile/                     (React Native + Expo)
    └── src/
        ├── screens/              (mismas pantallas que web, adaptadas a stack de React Navigation)
        ├── components/             (incluye MiniMapaSeguimiento con react-native-maps)
        ├── navigation/               (React Navigation: stack + tab navigator)
        └── styles/                    (StyleSheet.create + Dimensions/useWindowDimensions)
```

## Dependencias clave adicionales a instalar

- Backend: `socket.io`, `node-cron`, `jsonwebtoken`, `bcrypt`, `mysql2`, `express`, `cors`, `dotenv`
- Web: `react-leaflet`, `leaflet`, `socket.io-client`, `axios`, `react-router-dom`, `recharts` (gráficos de reportes/monitoreo)
- Móvil: `react-native-maps`, `socket.io-client`, `axios`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`, `expo-print`, `expo-sharing`
