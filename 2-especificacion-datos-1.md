# Especificacion de Base de Datos

---

## Generalidades

Motor: MySQL · Nombre de la base: `SisInstantlyExpress`

### Relaciones (diagrama lineal)

```
proveedores(1) ──> productos(N)
productos(N) ──> categorias(1)
usuarios(1) ──> carritos(1) ──> detalle_carrito(N) <── productos(N)
usuarios(1) ──> pedidos(N) <── proveedores(N)
pedidos(1) ──> detalle_pedidos(N) <── productos(N)
pedidos(1) ──> seguimiento_pedidos(1) ──> historial_seguimiento(N)
pedidos(1) ──> reportes(1)
usuarios(1) ──> resenas(N) <── productos(N)
usuarios(1) ──> direcciones_envio(N)
```

## Tablas

| Principales           | Secundarias              |
| ---------------------- | ------------------------ |
| usuarios                | categorias                |
| proveedores              | metodos_pago (catálogo)   |
| productos                | tipos_envio               |
| carritos                  | resenas                   |
| detalle_carrito           | direcciones_envio          |
| pedidos                   | notificaciones             |
| detalle_pedidos            | log_monitoreo_carrito       |
| seguimiento_pedidos          |                          |
| historial_seguimiento          |                          |

### Tabla usuarios

| Campo            | Tipo                                        | Restriccion                     |
| ---------------- | -------------------------------------------- | -------------------------------- |
| id_usuario        | integer                                        | primary key                       |
| nombre              | varchar(50)                                     | not null                           |
| apellidos            | varchar(50)                                      | not null                            |
| telefono               | varchar(10)                                       | not null                              |
| correo                   | varchar(100)                                       | not null, unique                        |
| contrasena                 | varchar(255)                                        | not null                                  |
| pais                          | varchar(50)                                          | not null                                    |
| fecha_registro                  | date                                                   | default (current_date())                      |
| rol                                | enum('admin','proveedor','cliente')                      | not null, default 'cliente'                      |
| activo                                | boolean                                                    | not null, default true                              |

### Tabla proveedores

| Campo             | Tipo          | Restriccion                          |
| ------------------ | -------------- | -------------------------------------- |
| id_proveedor          | integer         | primary key                              |
| id_usuario              | integer          | fk --> usuarios(id_usuario), unique         |
| nombre_empresa            | varchar(150)      | not null                                       |
| pais_origen                 | varchar(50)        | not null                                         |
| telefono_contacto              | varchar(20)         | not null                                           |
| direccion                         | varchar(250)         | not null                                             |
| forma_pago_preferida                 | varchar(50)           | not null                                               |
| estado_aprobacion                       | enum('pendiente','aprobado','rechazado') | not null, default 'pendiente' |
| fecha_solicitud                            | date                                        | default (current_date())          |

### Tabla categorias

| Campo         | Tipo         | Restriccion |
| -------------- | ------------- | ----------- |
| id_categoria     | integer        | primary key  |
| nombre             | varchar(100)     | not null      |
| tipo                  | enum('producto_fisico','catalogo_streaming','servicio') | not null |

### Tabla productos

| Campo                  | Tipo          | Restriccion                          |
| ------------------------ | -------------- | -------------------------------------- |
| id_producto                | integer         | primary key                              |
| id_proveedor                  | integer          | fk --> proveedores(id_proveedor)            |
| id_categoria                     | integer           | fk --> categorias(id_categoria)                |
| nombre                              | varchar(150)        | not null                                         |
| descripcion                            | varchar(500)         |                                                     |
| precio_unitario                           | decimal(10,2)         | not null                                             |
| cantidad_minima_mayoreo                      | integer                 | not null, default 1                                    |
| stock_disponible                                | integer                  | not null, default 0                                      |
| imagen_url                                        | varchar(255)              |                                                             |
| activo                                               | boolean                     | not null, default true                                       |
| fecha_publicacion                                       | date                          | default (current_date())                                        |

### Tabla direcciones_envio

| Campo            | Tipo         | Restriccion                   |
| ----------------- | ------------- | -------------------------------- |
| id_direccion         | integer        | primary key                        |
| id_usuario             | integer         | fk --> usuarios(id_usuario)           |
| pais                      | varchar(50)       | not null                                |
| ciudad                       | varchar(80)         | not null                                  |
| direccion_completa              | varchar(250)          | not null                                    |
| referencia                         | varchar(150)            |                                                |
| predeterminada                        | boolean                   | not null, default false                          |

### Tabla carritos

| Campo         | Tipo    | Restriccion                              |
| -------------- | -------- | ------------------------------------------ |
| id_carrito        | integer   | primary key                                  |
| id_usuario           | integer    | fk --> usuarios(id_usuario), unique              |
| fecha_creacion          | datetime    | default (current_timestamp())                       |
| fecha_actualizacion        | datetime      | on update current_timestamp()                          |

### Tabla detalle_carrito

| Campo               | Tipo    | Restriccion                        |
| --------------------- | -------- | -------------------------------------- |
| id_detalle_carrito         | integer   | primary key                              |
| id_carrito                    | integer    | fk --> carritos(id_carrito)                 |
| id_producto                      | integer     | fk --> productos(id_producto)                  |
| cantidad                            | integer      | not null, check (cantidad > 0)                    |
| fecha_agregado                         | datetime      | default (current_timestamp())                        |

### Tabla log_monitoreo_carrito

_Registro de auditoría/monitoreo de cada acción sobre el carrito, usado para el panel de monitoreo en tiempo real (no se muestra al cliente final, es para analítica y detección de problemas de stock)._

| Campo             | Tipo                                          | Restriccion                    |
| ------------------- | ----------------------------------------------- | --------------------------------- |
| id_log                 | integer                                            | primary key                          |
| id_usuario               | integer                                              | fk --> usuarios(id_usuario)             |
| id_producto                 | integer                                                | fk --> productos(id_producto)              |
| accion                         | enum('agregado','cantidad_modificada','eliminado','stock_insuficiente') | not null |
| cantidad_solicitada                | integer                                                                    | not null      |
| stock_en_momento                      | integer                                                                       | not null         |
| fecha_hora                                | datetime                                                                         | default (current_timestamp()) |

### Tabla tipos_envio

| Campo             | Tipo         | Restriccion |
| ------------------- | ------------- | ----------- |
| id_tipo_envio          | integer        | primary key  |
| nombre                    | varchar(50)      | not null, ej. 'Estándar', 'Express' |
| dias_estimados_min           | integer            | not null      |
| dias_estimados_max               | integer              | not null        |
| costo                                | decimal(10,2)          | not null           |

### Tabla pedidos

| Campo             | Tipo          | Restriccion                                                    |
| ------------------- | -------------- | ------------------------------------------------------------------ |
| id_pedido              | integer         | primary key                                                          |
| id_usuario                | integer          | fk --> usuarios(id_usuario)                                             |
| id_direccion                  | integer           | fk --> direcciones_envio(id_direccion)                                     |
| id_tipo_envio                    | integer            | fk --> tipos_envio(id_tipo_envio)                                             |
| fecha_pedido                        | date                  | default (current_date())                                                       |
| metodo_pago_elegido                    | varchar(50)             | not null (solo registro, sin procesar transacción real)                            |
| monto_total                                | decimal(10,2)             | not null                                                                              |
| estado                                        | enum('pendiente','confirmado','en_transito','entregado','cancelado') | not null, default 'pendiente' |

### Tabla detalle_pedidos

| Campo              | Tipo          | Restriccion                     |
| -------------------- | -------------- | ---------------------------------- |
| id_detalle_pedido        | integer         | primary key                           |
| id_pedido                   | integer          | fk --> pedidos(id_pedido)                 |
| id_producto                     | integer           | fk --> productos(id_producto)                |
| id_proveedor                        | integer            | fk --> proveedores(id_proveedor)                |
| cantidad                                | integer             | not null                                          |
| precio_unitario_congelado                  | decimal(10,2)         | not null (precio al momento de la compra)              |

### Tabla seguimiento_pedidos

_Estado de tracking simulado: no usa GPS real, calcula el porcentaje de avance en función del tiempo transcurrido contra el tiempo estimado del `tipo_envio`._

| Campo                | Tipo          | Restriccion                                    |
| ---------------------- | -------------- | --------------------------------------------------- |
| id_seguimiento              | integer         | primary key                                              |
| id_pedido                       | integer          | fk --> pedidos(id_pedido), unique                            |
| estado_actual                       | enum('pendiente','confirmado','en_transito','entregado','cancelado') | not null, default 'pendiente' |
| porcentaje_avance                       | integer                                                                 | not null, default 0, check (porcentaje_avance between 0 and 100) |
| latitud_simulada                            | decimal(10,6)                                                             | (coordenada simulada para el mapa, interpolada entre origen y destino) |
| longitud_simulada                               | decimal(10,6)                                                                |                                                                           |
| fecha_estimada_entrega                              | date                                                                            | not null                                                                    |
| ultima_actualizacion                                    | datetime                                                                           | default (current_timestamp()) on update current_timestamp()                    |

### Tabla historial_seguimiento

| Campo               | Tipo    | Restriccion                                    |
| --------------------- | -------- | --------------------------------------------------- |
| id_historial              | integer   | primary key                                              |
| id_seguimiento               | integer    | fk --> seguimiento_pedidos(id_seguimiento)                   |
| estado                          | varchar(20) | not null                                                       |
| porcentaje_avance                  | integer      | not null                                                         |
| descripcion                            | varchar(200)  | ej. 'Pedido confirmado por el proveedor'                            |
| fecha_hora                                | datetime        | default (current_timestamp())                                          |

### Tabla resenas

| Campo         | Tipo         | Restriccion                                   |
| -------------- | ------------- | --------------------------------------------------- |
| id_resena        | integer        | primary key                                              |
| id_usuario          | integer         | fk --> usuarios(id_usuario)                                  |
| id_producto            | integer          | fk --> productos(id_producto)                                    |
| fecha                     | date               | default (current_date())                                            |
| calificacion                 | integer              | not null, check (calificacion between 1 and 5)                          |
| comentario                      | varchar(500)          |                                                                              |

### Tabla notificaciones

| Campo         | Tipo         | Restriccion                                                     |
| -------------- | ------------- | ---------------------------------------------------------------- |
| id_notificacion  | integer        | primary key                                                          |
| id_usuario          | integer         | fk --> usuarios(id_usuario)                                              |
| tipo                   | enum('pedido_actualizado','stock_bajo','proveedor_aprobado','pedido_entregado') | not null |
| mensaje                     | varchar(255)                                                                       | not null    |
| leida                          | boolean                                                                               | not null, default false |
| fecha_hora                        | datetime                                                                                 | default (current_timestamp()) |

## Observacion

- `reportes` no se implementa como tabla física: se genera con `SELECT` agregados sobre `pedidos`, `detalle_pedidos` y `productos` (ventas por proveedor, top 10 productos más pedidos, tiempos promedio de entrega).
- El **monitoreo de carrito en tiempo real** combina la validación síncrona contra `productos.stock_disponible` (bloqueante, ver RS-06) con el registro asíncrono en `log_monitoreo_carrito` (no bloqueante, solo para analítica del panel de administrador).
- El **tracking simulado** (`seguimiento_pedidos` + `historial_seguimiento`) es actualizado por un proceso programado (cron/job) en el backend que avanza `porcentaje_avance` y recalcula `latitud_simulada`/`longitud_simulada` por interpolación lineal entre las coordenadas de origen (proveedor) y destino (`direcciones_envio`), según el tiempo transcurrido vs. `dias_estimados_min`/`max` del `tipo_envio`.

_Nota:_ Crear script para montar en MySQL version 8.x o mas reciente.
