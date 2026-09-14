-- =====================================================================
-- Script de Base de Datos: Instantly Express
-- Sistema de distribución, mayoreo y streaming de catálogos
-- Motor: MySQL 8.x o superior
-- =====================================================================

DROP DATABASE IF EXISTS SisInstantlyExpress;
CREATE DATABASE SisInstantlyExpress
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE SisInstantlyExpress;

-- =====================================================================
-- 1. TABLA usuarios
-- =====================================================================
CREATE TABLE usuarios (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50)  NOT NULL,
    apellidos       VARCHAR(50)  NOT NULL,
    telefono        VARCHAR(10)  NOT NULL,
    correo          VARCHAR(100) NOT NULL,
    contrasena      VARCHAR(255) NOT NULL,
    pais            VARCHAR(50)  NOT NULL,
    fecha_registro  DATE         NOT NULL DEFAULT (CURRENT_DATE()),
    rol             ENUM('admin','proveedor','cliente') NOT NULL DEFAULT 'cliente',
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_usuarios_correo UNIQUE (correo)
) ENGINE=InnoDB;

-- =====================================================================
-- 2. TABLA proveedores
-- =====================================================================
CREATE TABLE proveedores (
    id_proveedor          INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario            INT NOT NULL,
    nombre_empresa        VARCHAR(150) NOT NULL,
    pais_origen           VARCHAR(50)  NOT NULL,
    telefono_contacto     VARCHAR(20)  NOT NULL,
    direccion             VARCHAR(250) NOT NULL,
    forma_pago_preferida  VARCHAR(50)  NOT NULL,
    estado_aprobacion     ENUM('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
    fecha_solicitud       DATE NOT NULL DEFAULT (CURRENT_DATE()),
    CONSTRAINT uq_proveedores_usuario UNIQUE (id_usuario),
    CONSTRAINT fk_proveedores_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 3. TABLA categorias
-- =====================================================================
CREATE TABLE categorias (
    id_categoria  INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    tipo          ENUM('producto_fisico','catalogo_streaming','servicio') NOT NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 4. TABLA productos
-- =====================================================================
CREATE TABLE productos (
    id_producto               INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor              INT NOT NULL,
    id_categoria              INT NOT NULL,
    nombre                    VARCHAR(150) NOT NULL,
    descripcion               VARCHAR(500),
    precio_unitario           DECIMAL(10,2) NOT NULL,
    cantidad_minima_mayoreo   INT NOT NULL DEFAULT 1,
    stock_disponible          INT NOT NULL DEFAULT 0,
    imagen_url                VARCHAR(255),
    activo                    BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_publicacion         DATE NOT NULL DEFAULT (CURRENT_DATE()),
    CONSTRAINT fk_productos_proveedor FOREIGN KEY (id_proveedor)
        REFERENCES proveedores(id_proveedor)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_productos_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_productos_mayoreo CHECK (cantidad_minima_mayoreo >= 1),
    CONSTRAINT chk_productos_stock CHECK (stock_disponible >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_proveedor ON productos(id_proveedor);
CREATE INDEX idx_productos_nombre ON productos(nombre);

-- =====================================================================
-- 5. TABLA direcciones_envio
-- =====================================================================
CREATE TABLE direcciones_envio (
    id_direccion         INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario           INT NOT NULL,
    pais                 VARCHAR(50)  NOT NULL,
    ciudad               VARCHAR(80)  NOT NULL,
    direccion_completa   VARCHAR(250) NOT NULL,
    referencia           VARCHAR(150),
    predeterminada       BOOLEAN NOT NULL DEFAULT FALSE,
    -- Coordenadas de destino usadas por el motor de simulación de tracking
    latitud              DECIMAL(10,6),
    longitud             DECIMAL(10,6),
    CONSTRAINT fk_direcciones_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 6. TABLA carritos
-- =====================================================================
CREATE TABLE carritos (
    id_carrito            INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario            INT NOT NULL,
    fecha_creacion        DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP()),
    fecha_actualizacion   DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP())
                               ON UPDATE CURRENT_TIMESTAMP(),
    CONSTRAINT uq_carritos_usuario UNIQUE (id_usuario),
    CONSTRAINT fk_carritos_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 7. TABLA detalle_carrito
-- =====================================================================
CREATE TABLE detalle_carrito (
    id_detalle_carrito  INT AUTO_INCREMENT PRIMARY KEY,
    id_carrito          INT NOT NULL,
    id_producto         INT NOT NULL,
    cantidad            INT NOT NULL,
    fecha_agregado      DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP()),
    CONSTRAINT fk_detcarrito_carrito FOREIGN KEY (id_carrito)
        REFERENCES carritos(id_carrito)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detcarrito_producto FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_detcarrito_carrito_producto UNIQUE (id_carrito, id_producto),
    CONSTRAINT chk_detcarrito_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

-- =====================================================================
-- 8. TABLA log_monitoreo_carrito
-- Registro de auditoría del monitoreo de carrito en tiempo real (RS-06)
-- =====================================================================
CREATE TABLE log_monitoreo_carrito (
    id_log               INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario           INT NOT NULL,
    id_producto          INT NOT NULL,
    accion               ENUM('agregado','cantidad_modificada','eliminado','stock_insuficiente') NOT NULL,
    cantidad_solicitada  INT NOT NULL,
    stock_en_momento     INT NOT NULL,
    fecha_hora           DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP()),
    CONSTRAINT fk_logmonitoreo_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_logmonitoreo_producto FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_logmonitoreo_fecha ON log_monitoreo_carrito(fecha_hora);
CREATE INDEX idx_logmonitoreo_accion ON log_monitoreo_carrito(accion);

-- =====================================================================
-- 9. TABLA tipos_envio
-- =====================================================================
CREATE TABLE tipos_envio (
    id_tipo_envio        INT AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(50) NOT NULL,
    dias_estimados_min   INT NOT NULL,
    dias_estimados_max   INT NOT NULL,
    costo                DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_tiposenvio_dias CHECK (dias_estimados_max >= dias_estimados_min)
) ENGINE=InnoDB;

-- =====================================================================
-- 10. TABLA pedidos
-- =====================================================================
CREATE TABLE pedidos (
    id_pedido             INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario            INT NOT NULL,
    id_direccion          INT NOT NULL,
    id_tipo_envio         INT NOT NULL,
    fecha_pedido          DATE NOT NULL DEFAULT (CURRENT_DATE()),
    metodo_pago_elegido   VARCHAR(50) NOT NULL,
    monto_total           DECIMAL(10,2) NOT NULL,
    estado                ENUM('pendiente','confirmado','en_transito','entregado','cancelado')
                              NOT NULL DEFAULT 'pendiente',
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pedidos_direccion FOREIGN KEY (id_direccion)
        REFERENCES direcciones_envio(id_direccion)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pedidos_tipoenvio FOREIGN KEY (id_tipo_envio)
        REFERENCES tipos_envio(id_tipo_envio)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_pedidos_monto CHECK (monto_total >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_pedidos_usuario ON pedidos(id_usuario);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);

-- =====================================================================
-- 11. TABLA detalle_pedidos
-- =====================================================================
CREATE TABLE detalle_pedidos (
    id_detalle_pedido           INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido                   INT NOT NULL,
    id_producto                 INT NOT NULL,
    id_proveedor                INT NOT NULL,
    cantidad                    INT NOT NULL,
    precio_unitario_congelado   DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detpedidos_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detpedidos_producto FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_detpedidos_proveedor FOREIGN KEY (id_proveedor)
        REFERENCES proveedores(id_proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_detpedidos_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_detpedidos_proveedor ON detalle_pedidos(id_proveedor);

-- =====================================================================
-- 12. TABLA seguimiento_pedidos
-- Tracking simulado/estimado (sin GPS real, ver especificación técnica)
-- =====================================================================
CREATE TABLE seguimiento_pedidos (
    id_seguimiento          INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido               INT NOT NULL,
    estado_actual           ENUM('pendiente','confirmado','en_transito','entregado','cancelado')
                                NOT NULL DEFAULT 'pendiente',
    porcentaje_avance       INT NOT NULL DEFAULT 0,
    latitud_simulada        DECIMAL(10,6),
    longitud_simulada       DECIMAL(10,6),
    fecha_estimada_entrega  DATE NOT NULL,
    ultima_actualizacion    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP())
                                ON UPDATE CURRENT_TIMESTAMP(),
    CONSTRAINT uq_seguimiento_pedido UNIQUE (id_pedido),
    CONSTRAINT fk_seguimiento_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_seguimiento_porcentaje CHECK (porcentaje_avance BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- =====================================================================
-- 13. TABLA historial_seguimiento
-- =====================================================================
CREATE TABLE historial_seguimiento (
    id_historial        INT AUTO_INCREMENT PRIMARY KEY,
    id_seguimiento       INT NOT NULL,
    estado                VARCHAR(20) NOT NULL,
    porcentaje_avance     INT NOT NULL,
    descripcion           VARCHAR(200),
    fecha_hora            DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP()),
    CONSTRAINT fk_historial_seguimiento FOREIGN KEY (id_seguimiento)
        REFERENCES seguimiento_pedidos(id_seguimiento)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_historial_fecha ON historial_seguimiento(fecha_hora);

-- =====================================================================
-- 14. TABLA resenas
-- =====================================================================
CREATE TABLE resenas (
    id_resena       INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    id_producto     INT NOT NULL,
    fecha           DATE NOT NULL DEFAULT (CURRENT_DATE()),
    calificacion    INT NOT NULL,
    comentario      VARCHAR(500),
    CONSTRAINT fk_resenas_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_resenas_producto FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_resenas_calificacion CHECK (calificacion BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- =====================================================================
-- 15. TABLA notificaciones
-- =====================================================================
CREATE TABLE notificaciones (
    id_notificacion  INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT NOT NULL,
    tipo             ENUM('pedido_actualizado','stock_bajo','proveedor_aprobado','pedido_entregado') NOT NULL,
    mensaje          VARCHAR(255) NOT NULL,
    leida            BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_hora       DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP()),
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notificaciones_usuario_leida ON notificaciones(id_usuario, leida);

-- =====================================================================
-- DATOS SEMILLA (catálogos base necesarios para operar el sistema)
-- =====================================================================

-- Categorías base
INSERT INTO categorias (nombre, tipo) VALUES
    ('Catálogo de plataformas de streaming', 'catalogo_streaming'),
    ('Flores y arreglos florales',            'producto_fisico'),
    ('Electrónica de consumo',                 'producto_fisico'),
    ('Ropa y accesorios',                       'producto_fisico'),
    ('Servicios de publicidad digital',            'servicio');

-- Tipos de envío base
INSERT INTO tipos_envio (nombre, dias_estimados_min, dias_estimados_max, costo) VALUES
    ('Estándar', 5, 10, 8.00),
    ('Express',  2, 4,  18.50),
    ('Virtual (catálogos streaming)', 0, 1, 0.00);

-- Usuario administrador inicial (contraseña debe hashearse con bcrypt en la app,
-- este valor es un marcador de posición para desarrollo, NO usar en producción)
INSERT INTO usuarios (nombre, apellidos, telefono, correo, contrasena, pais, rol) VALUES
    ('Admin', 'Instantly Express', '00000000', 'admin@instantlyexpress.com',
     '$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL', 'El Salvador', 'admin');

INSERT INTO usuarios (nombre, apellidos, telefono, correo, contrasena, pais, rol) VALUES
    ('Equipo', 'Nube Media', '00000001', 'catalogos@instantlyexpress.com',
     '$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL', 'El Salvador', 'proveedor');

INSERT INTO proveedores (id_usuario, nombre_empresa, pais_origen, telefono_contacto, direccion, forma_pago_preferida, estado_aprobacion)
VALUES (2, 'Nube Media', 'El Salvador', '00000001', 'San Salvador', 'Transferencia', 'aprobado');

INSERT INTO productos (id_proveedor, id_categoria, nombre, descripcion, precio_unitario, cantidad_minima_mayoreo, stock_disponible, activo) VALUES
    (1, 1, 'Catálogo Stream Premium', 'Acceso mayorista para catálogos digitales y campañas de contenido.', 18.50, 5, 86, TRUE),
    (1, 2, 'Arreglo floral corporativo', 'Presentación premium para oficinas, eventos y escaparates.', 26.90, 4, 18, TRUE),
    (1, 3, 'Kit de iluminación LED', 'Kit compacto para creadores y vitrinas comerciales.', 42.00, 3, 31, TRUE),
    (1, 4, 'Pack de accesorios urbanos', 'Selección de accesorios de alta rotación para venta minorista.', 11.75, 10, 120, TRUE),
    (1, 5, 'Servicio de pauta digital', 'Gestión de campañas digitales para lanzamientos comerciales.', 75.00, 1, 999, TRUE),
    (1, 3, 'Audífonos de estudio', 'Audio cerrado para streaming, edición y monitoreo.', 29.90, 5, 44, TRUE);

-- =====================================================================
-- Fin del script
-- =====================================================================
