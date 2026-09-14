import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import mysql from 'mysql2/promise';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
const url = new URL(process.env.MYSQL_URL);
const conexion = await mysql.createConnection({ host: url.hostname, port: Number(url.port), user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database: url.pathname.slice(1), ssl: { rejectUnauthorized: false }, multipleStatements: true });
const sql = fs.readFileSync(new URL('../../database/script.sql', import.meta.url), 'utf8');
await conexion.query(sql);
await conexion.query("INSERT IGNORE INTO usuarios (nombre, apellidos, telefono, correo, contrasena, pais, rol) VALUES ('Equipo', 'Nube Media', '00000001', 'catalogos@instantlyexpress.com', '$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL', 'El Salvador', 'proveedor')");
await conexion.query("INSERT IGNORE INTO proveedores (id_usuario, nombre_empresa, pais_origen, telefono_contacto, direccion, forma_pago_preferida, estado_aprobacion) SELECT id_usuario, 'Nube Media', 'El Salvador', '00000001', 'San Salvador', 'Transferencia', 'aprobado' FROM usuarios WHERE correo = 'catalogos@instantlyexpress.com'");
const [proveedores] = await conexion.query("SELECT id_proveedor FROM proveedores WHERE nombre_empresa = 'Nube Media' LIMIT 1");
if (proveedores[0]) {
	await conexion.query("INSERT INTO productos (id_proveedor, id_categoria, nombre, descripcion, precio_unitario, cantidad_minima_mayoreo, stock_disponible, activo) SELECT ?, id_categoria, ?, ?, ?, ?, ?, TRUE FROM categorias WHERE nombre = ? LIMIT 1", [proveedores[0].id_proveedor, 'Catálogo Stream Premium', 'Acceso mayorista para catálogos digitales y campañas de contenido.', 18.50, 5, 86, 'Catálogo de plataformas de streaming']);
	await conexion.query("INSERT INTO productos (id_proveedor, id_categoria, nombre, descripcion, precio_unitario, cantidad_minima_mayoreo, stock_disponible, activo) SELECT ?, id_categoria, ?, ?, ?, ?, ?, TRUE FROM categorias WHERE nombre = ? LIMIT 1", [proveedores[0].id_proveedor, 'Kit de iluminación LED', 'Kit compacto para creadores y vitrinas comerciales.', 42.00, 3, 31, 'Electrónica de consumo']);
	await conexion.query("INSERT INTO productos (id_proveedor, id_categoria, nombre, descripcion, precio_unitario, cantidad_minima_mayoreo, stock_disponible, activo) SELECT ?, id_categoria, ?, ?, ?, ?, ?, TRUE FROM categorias WHERE nombre = ? LIMIT 1", [proveedores[0].id_proveedor, 'Arreglo floral corporativo', 'Presentación premium para oficinas, eventos y escaparates.', 26.90, 4, 18, 'Flores y arreglos florales']);
	await conexion.query("INSERT INTO productos (id_proveedor, id_categoria, nombre, descripcion, precio_unitario, cantidad_minima_mayoreo, stock_disponible, activo) SELECT ?, id_categoria, ?, ?, ?, ?, ?, TRUE FROM categorias WHERE nombre = ? LIMIT 1", [proveedores[0].id_proveedor, 'Pack de accesorios urbanos', 'Selección de accesorios de alta rotación para venta minorista.', 11.75, 10, 120, 'Ropa y accesorios']);
	await conexion.query("INSERT INTO productos (id_proveedor, id_categoria, nombre, descripcion, precio_unitario, cantidad_minima_mayoreo, stock_disponible, activo) SELECT ?, id_categoria, ?, ?, ?, ?, ?, TRUE FROM categorias WHERE nombre = ? LIMIT 1", [proveedores[0].id_proveedor, 'Servicio de pauta digital', 'Gestión de campañas digitales para lanzamientos comerciales.', 75.00, 1, 999, 'Servicios de publicidad digital']);
	await conexion.query("INSERT INTO productos (id_proveedor, id_categoria, nombre, descripcion, precio_unitario, cantidad_minima_mayoreo, stock_disponible, activo) SELECT ?, id_categoria, ?, ?, ?, ?, ?, TRUE FROM categorias WHERE nombre = ? LIMIT 1", [proveedores[0].id_proveedor, 'Audífonos de estudio', 'Audio cerrado para streaming, edición y monitoreo.', 29.90, 5, 44, 'Electrónica de consumo']);
	const adicionales = [
		['Monitor portátil 15 pulgadas', 'Pantalla ligera para estaciones de trabajo móviles.', 119.90, 2, 27, 'Electrónica de consumo'],
		['Cámara web Full HD', 'Cámara para videollamadas, streaming y clases remotas.', 38.50, 5, 65, 'Electrónica de consumo'],
		['Mochila ejecutiva urbana', 'Mochila resistente para equipos y accesorios de negocio.', 34.90, 5, 42, 'Ropa y accesorios'],
		['Set de organizadores de viaje', 'Organizadores textiles para inventario y viajes comerciales.', 16.90, 10, 88, 'Ropa y accesorios'],
		['Kit de branding para eventos', 'Material promocional para activaciones y lanzamientos.', 54.00, 3, 24, 'Servicios de publicidad digital'],
		['Campaña social media inicial', 'Paquete de estrategia y contenidos para redes sociales.', 145.00, 1, 12, 'Servicios de publicidad digital'],
		['Suscripción catálogo familiar', 'Licencias digitales para distribución mayorista.', 22.00, 5, 150, 'Catálogo de plataformas de streaming'],
		['Paquete contenido premium', 'Selección de contenido para vitrinas digitales.', 31.50, 5, 72, 'Catálogo de plataformas de streaming'],
		['Caja regalo corporativa', 'Selección de productos para clientes y equipos.', 48.00, 4, 30, 'Flores y arreglos florales'],
		['Centro floral premium', 'Decoración floral para recepción y eventos.', 39.90, 4, 20, 'Flores y arreglos florales'],
		['Luz de escritorio profesional', 'Iluminación regulable para escritorios y estudios.', 24.50, 5, 56, 'Electrónica de consumo'],
		['Teclado compacto inalámbrico', 'Teclado silencioso para oficinas y estaciones móviles.', 27.90, 5, 48, 'Electrónica de consumo']
	];
	for (const producto of adicionales) await conexion.query("INSERT INTO productos (id_proveedor, id_categoria, nombre, descripcion, precio_unitario, cantidad_minima_mayoreo, stock_disponible, activo) SELECT ?, id_categoria, ?, ?, ?, ?, ?, TRUE FROM categorias WHERE nombre = ? LIMIT 1", [proveedores[0].id_proveedor, ...producto]);
}
await conexion.query('DELETE producto_repetido FROM productos producto_repetido INNER JOIN productos producto_original ON producto_repetido.nombre = producto_original.nombre AND producto_repetido.id_producto > producto_original.id_producto');
const [tablas] = await conexion.query('SHOW TABLES FROM SisInstantlyExpress');
console.log(`TABLAS=${tablas.length}`);
await conexion.end();
