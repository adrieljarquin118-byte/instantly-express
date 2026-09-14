# Especificaciones del Sistema

---

"Creado por":"Instantly Express - Equipo Desarrollo de Software"
"Sistema":"Sistema de distribución, mayoreo y streaming de catálogos - Instantly Express"
"Version":1.0
"Fecha de creacion":04/09/2026

## Vision general

_**Problema:** Las microempresas no tienen forma de publicitar ni distribuir sus productos a mercados internacionales sin depender de grandes corporaciones. Se propone una plataforma digital que centralice catálogos de múltiples proveedores (incluyendo catálogos de plataformas de streaming y otros productos de mayoreo), gestione pedidos por mayoreo y dé seguimiento visual al envío hasta el cliente final._
_**Usuario:** Administrador (control total de la plataforma), Proveedor (publica y gestiona su catálogo), Cliente mayorista (navega catálogos, compra por mayoreo, da seguimiento a sus pedidos)_
_**Alcance:** Catálogo multi-proveedor, Carrito de compras con monitoreo/tracking, Pedidos y mayoreo, Seguimiento de envío en mapa (simulado), Notificaciones, Reportes, Gestión de proveedores_
_**Fuera de alcance:** Pasarela de pago real (se registra el monto y método elegido en base de datos, no se procesa transacción real), GPS real de repartidores (el tracking es simulado/estimado por estados y tiempos), Facturación electrónica fiscal_
_**Version:** Todas las dependencias actualizadas a la ultima version tanto backend como frontend_

Se requieren **dos frontends** consumiendo el **mismo backend**. React (web) y React Native (móvil) no comparten componentes de UI (CSS vs. StyleSheet, DOM vs. vistas nativas), así que se generan como dos proyectos independientes dentro de un monorepo, compartiendo solo lo que es agnóstico de plataforma.

| Capa                 | Tecnología                  |
| -------------------- | ---------------------------- |
| Backend (compartido) | Node.js + Express + JWT      |
| Driver DB            | mysql2                       |
| Base de datos        | MySQL                        |
| Frontend Web         | React + Vite + React Router  |
| Frontend APK         | React Native + Expo          |
| Mapas                | Leaflet (web) / react-native-maps con proveedor simulado (móvil) |
| Tiempo real          | WebSockets (socket.io) para actualización de estado de pedido y posición simulada |
| Testing              | Jest + Supertest (backend)   |

**Qué se comparte entre web y APK:**

- Capa de servicios/API (`axios`, funciones `fnObtenerCatalogo`, `fnRegistrarPedido`, `fnObtenerEstadoPedido`, etc. — la lógica de fetch es igual, solo cambia el storage del token: `localStorage` en web vs. `AsyncStorage`/`expo-secure-store` en APK).
- Tokens de diseño: colores y tipografía como objeto JS/TS (`theme.js`) importado en ambos.
- Reglas de negocio de validación de formularios (cantidad mínima de mayoreo, stock disponible, DUI/NIT de proveedor) como funciones puras reutilizables.
- Lógica de simulación de tracking (cálculo de progreso estimado entre estados del pedido) como módulo puro compartido (`shared/simulacionTracking.js`), ya que el motor de progreso es el mismo, solo cambia cómo se dibuja el mapa.
- Cliente de WebSockets (conexión y manejo de eventos `pedido:actualizado`) reutilizado en ambas plataformas.

**Qué NO se comparte (implementar distinto en cada uno):**

- Componentes visuales (web usa CSS/Tailwind/Styled-Components; APK usa `StyleSheet` + Flexbox nativo de RN).
- Navegación (web: React Router; APK: React Navigation).
- Implementación del mapa: Web usa Leaflet + OpenStreetMap embebido en la página; APK usa `react-native-maps` con markers animados.
- Los breakpoints 480p/720p/1024p del documento de diseño **aplican solo a la versión web**. Para el APK, el equivalente es Flexbox relativo y `useWindowDimensions`/`Dimensions`.
- Exportación de reportes: Web usa `window.print()`/exportar PDF; APK usa `expo-print`/`expo-sharing`.

**Build del APK:** generar con Expo (`expo prebuild` + Gradle), usando JDK 17 y Android SDK sin necesidad de Android Studio completo. Conservar solo el APK final de `release` y limpiar artefactos intermedios (`build/`, caché de Gradle) tras compilar.

**Reglas de codificación obligatorias:**

- Prefijos: `btn-xxxx` (botones), `fnXxxXxx` (funciones), `tb-xxxx` (tablas/grids), `varXxx` (variables)
- Nombres y descripciones únicamente en español
- Cada función debe tener comentario con: nombre, descripción, funcionamiento y qué retorna
- Documentar funciones secundarias con datos específicos que requieran
- Separar código en carpetas `backend/`, `shared/`, `web/` y `mobile/` (crearlas si no existen)
- Todas las dependencias en su versión más reciente estable

## Reglas del sistema

| #     | Regla                                                                                                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RS-01 | Un cliente mayorista no puede agregar al carrito una cantidad mayor a la existencia (`stock_disponible`) de un producto                                    |
| RS-02 | Toda compra debe cumplir la **cantidad mínima de mayoreo** (`cantidad_minima_mayoreo`) definida por el proveedor para ese producto                          |
| RS-03 | Un proveedor solo puede crear/modificar/eliminar productos de su propio catálogo (`id_proveedor` debe coincidir con el usuario autenticado)                 |
| RS-04 | Un pedido pasa por los estados: `pendiente` → `confirmado` → `en_transito` → `entregado` (o `cancelado`); no se permite saltar de `pendiente` a `entregado` |
| RS-05 | Solo el rol `admin` puede aprobar el alta de un nuevo proveedor antes de que su catálogo sea visible públicamente                                           |
| RS-06 | Al agregar un producto al carrito, el sistema **monitorea/valida en tiempo real** el stock contra la base de datos antes de confirmar la adición            |
| RS-07 | El tracking de envío es **simulado**: el backend avanza el estado y el porcentaje de progreso según tiempos estimados configurados por tipo de envío, no según GPS real |

Reglas de registro adicionales (de HU-01 / HB-02 / HB-03):

- Al agregar un producto al carrito: verificar `stock_disponible >= cantidad_solicitada` y `cantidad_solicitada >= cantidad_minima_mayoreo`; si falla, rechazar con mensaje específico (stock insuficiente o mayoreo no alcanzado).
- Al confirmar un pedido: descontar `stock_disponible` del producto en la cantidad comprada y crear el registro en `seguimiento_pedidos` con estado inicial `pendiente` y tiempo estimado de entrega según `tipo_envio`.
- Cada cambio de estado del pedido genera un evento WebSocket (`pedido:actualizado`) y un registro en `historial_seguimiento` con fecha/hora y porcentaje de avance.
- Login unificado: POST /api/auth/login autentica siempre contra `usuarios` (correo + contraseña); el JWT incluye `rol`. El proveedor es un usuario con rol='proveedor', vinculado a un registro en `proveedores`.

---

## Intercambios de perfiles

- Cliente mayorista: Acceso a catálogo multi-proveedor (solo lectura), acceso a carrito con monitoreo de stock en tiempo real, acceso a historial de pedidos, acceso a seguimiento en mapa de sus propios pedidos, acceso a reseñas.
- Proveedor: Acceso a gestión de su propio catálogo (crear/editar/eliminar productos), acceso a pedidos recibidos de sus productos, acceso a reportes de ventas de su catálogo, acceso a alertas de stock bajo.
- Administrador: Acceso total — aprobación de proveedores, gestión de todos los catálogos, gestión de pedidos y seguimiento, reportes globales, gestión de usuarios, configuración de tiempos estimados de envío.
