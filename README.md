# Instantly Express — Paquete de Especificaciones

Sistema de distribución, mayoreo y streaming de catálogos, con monitoreo de carrito en tiempo real y seguimiento simulado de pedidos en mapa.

## Contenido

| Archivo | Descripción |
| --- | --- |
| `1-especificacion-sistema-general.md` | Visión general, roles, stack tecnológico, reglas del sistema |
| `2-especificacion-datos.md` | Modelo de base de datos MySQL, 15 tablas, relaciones |
| `3-especificacion-diseno.md` | UI/UX estilo dashboard logístico tech, pantallas web/móvil, uso del logo |
| `4-especificacion-tecnica.md` | Endpoints, WebSockets, motor de simulación de tracking, estructura de carpetas |
| `5-especificacion-animacion.md` | Duraciones, easing y comportamiento de animaciones web/móvil |
| `6-especificacion-validacion.md` | Plan de pruebas, casos de prueba de stock y tracking |
| `database/script.sql` | Script DDL completo listo para ejecutar en MySQL 8.x |
| `assets/` | Logo oficial en todas sus variantes y tamaños |

## Assets del logo — guía rápida

| Archivo | Uso recomendado |
| --- | --- |
| `logo-completo-master.png` (1600×1600) | Fuente maestra, no usar directo en producción |
| `logo-completo-1024.png` | Login/registro en desktop, materiales de marketing |
| `logo-completo-640.png` | Login/registro en tablet/móvil de alta densidad |
| `logo-completo-320.png` | Splash screen móvil, previews pequeñas |
| `isotipo-master.png` (1312×1312) | Fuente maestra del isotipo, no usar directo |
| `isotipo-512.png` | Ícono de app (Play Store / App Store) |
| `isotipo-192.png` | Ícono PWA / adaptive icon Android |
| `isotipo-40.png` / `@2x` / `@3x` | Header de la app (40px base, según densidad de pantalla) |
| `favicon-32.png` / `favicon-16.png` | Favicon del sitio web |

Todas las variantes del isotipo están recortadas únicamente al camión con las iniciales "IE" (sin el texto "Instantly Express"), sobre el mismo fondo claro del logo original, listas para colocarse dentro de un contenedor propio en el header según la especificación de diseño (sección "Logo e identidad de marca").

## Cómo montar la base de datos

```bash
mysql -u root -p < database/script.sql
```

El script crea la base `SisInstantlyExpress`, las 15 tablas en orden de dependencias, sus índices, restricciones (`CHECK`, `FOREIGN KEY`, `UNIQUE`), y datos semilla mínimos: categorías base, tipos de envío base, y un usuario administrador inicial (la contraseña de este usuario es un marcador de posición — debe reemplazarse por un hash `bcrypt` real antes de usar en cualquier ambiente).

## Aplicación implementada

La solución está separada en `backend/`, `web/`, `mobile/` y `shared/`. El backend incluye una implementación demo en memoria para poder probar los flujos sin bloquear el arranque si MySQL aún no está instalado; el `database/script.sql` queda listo para conectar la persistencia MySQL en el siguiente paso.

### Arranque local

```bash
npm.cmd install --prefix backend
npm.cmd install --prefix web
npm.cmd --prefix backend run dev
npm.cmd --prefix web run dev
```

Abre `http://localhost:5173`. La API local usa el puerto `4010`. Credenciales demo: `cliente@demo.com` / `123456`; administrador: `admin@demo.com` / `admin123`. Para usar otro puerto de API, define `VITE_API_URL` en web y `EXPO_PUBLIC_API_URL` en mobile. En un teléfono físico, usa la IP local del equipo en vez de `localhost`.

La app web cubre login, catálogo, filtros por texto, carrito con validación de mayoreo/stock, pedidos, tracking visual, estado Socket.IO y layout responsive. La app Expo usa tabs nativas y consume exactamente los mismos endpoints. El tracking demo avanza los pedidos `en_transito` cada dos minutos y emite `pedido:actualizado`.

### Mejoras de proyecto

- Seguridad: JWT, bcrypt, límite de intentos de login y autorización por rol.
- Administración: `GET /api/admin/proveedores`, `PUT /api/admin/proveedores/:id/aprobar`, `GET /api/admin/reportes` y `PUT /api/pedidos/:id/estado`.
- Pruebas automatizadas: `backend/tests/api.test.js` con Jest y Supertest.
- Respaldo: ejecutar `backend/scripts/respaldo.ps1` con `MYSQL_HOST` y `MYSQL_USER` configurados.
- Recuperación: `POST /api/auth/recuperar` responde sin revelar si un correo existe; para correo real falta conectar SMTP.

### Cuentas compartidas

El botón `Crear una cuenta nueva` de la web registra un usuario mediante `POST /api/auth/registro`, guarda la contraseña con bcrypt y después inicia su sesión con JWT. Esa misma cuenta se puede usar en la app móvil mediante `POST /api/auth/login`, ya que ambas aplicaciones consumen el mismo backend. En el modo demo los usuarios viven en memoria y se reinician al detener el backend; al conectar MySQL quedarán persistentes.

## Orden sugerido de lectura

1. Sistema general (visión y reglas)
2. Datos (modelo de base de datos)
3. Técnica (endpoints y arquitectura)
4. Diseño (UI/UX)
5. Animación (comportamiento de interfaz)
6. Validación (plan de pruebas)
