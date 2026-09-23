import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
import express from "express";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Server } from "socket.io";
import {
  fnConsultarBaseDatos,
  fnComprobarBaseDatos,
  fnTransaccionBaseDatos,
} from "./db.js";

const app = express();
const servidor = http.createServer(app);
const io = new Server(servidor, { cors: { origin: "*" } });
const secreto = process.env.JWT_SECRETO || "desarrollo-instantly-express";
const usuarios = [
  {
    id: 1,
    nombre: "María",
    apellidos: "Comercio",
    correo: "cliente@demo.com",
    contrasena: bcrypt.hashSync("123456", 10),
    rol: "cliente",
  },
  {
    id: 2,
    nombre: "Admin",
    apellidos: "Instantly Express",
    correo: "admin@demo.com",
    contrasena: bcrypt.hashSync("admin123", 10),
    rol: "admin",
  },
];
const productos = [
  {
    id: 1,
    nombre: "Catálogo Stream Premium",
    proveedor: "Nube Media",
    categoria: "Streaming",
    precio: 18.5,
    minimo: 5,
    stock: 86,
    color: "#00E5FF",
    imagen:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60",
    descripcion:
      "Acceso mayorista para catálogos digitales y campañas de contenido.",
  },
  {
    id: 2,
    nombre: "Kit de iluminación LED",
    proveedor: "Volt Supply",
    categoria: "Electrónica",
    precio: 42,
    minimo: 3,
    stock: 31,
    color: "#FF7A1A",
    imagen:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=60",
    descripcion: "Kit compacto para creadores y vitrinas comerciales.",
  },
  {
    id: 3,
    nombre: "Arreglo floral corporativo",
    proveedor: "Flora Norte",
    categoria: "Producto físico",
    precio: 26.9,
    minimo: 4,
    stock: 18,
    color: "#39FF6A",
    imagen:
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=60",
    descripcion: "Presentación premium para oficinas, eventos y escaparates.",
  },
  {
    id: 4,
    nombre: "Pack de accesorios urbanos",
    proveedor: "Distrito 9",
    categoria: "Ropa y accesorios",
    precio: 11.75,
    minimo: 10,
    stock: 120,
    color: "#FFC93C",
    imagen:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=60",
    descripcion:
      "Selección de accesorios de alta rotación para venta minorista.",
  },
  {
    id: 5,
    nombre: "Servicio de pauta digital",
    proveedor: "Nube Media",
    categoria: "Servicios",
    precio: 75,
    minimo: 1,
    stock: 999,
    color: "#B991FF",
    imagen:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
    descripcion: "Gestión de campañas digitales para lanzamientos comerciales.",
  },
  {
    id: 6,
    nombre: "Audífonos de estudio",
    proveedor: "Volt Supply",
    categoria: "Electrónica",
    precio: 29.9,
    minimo: 5,
    stock: 44,
    color: "#FF4757",
    imagen:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=60",
    descripcion: "Audio cerrado para streaming, edición y monitoreo.",
  },
];
const productosComplementarios = [
  "Monitor portátil 15 pulgadas",
  "Cámara web Full HD",
  "Mochila ejecutiva urbana",
  "Set de organizadores de viaje",
  "Kit de branding para eventos",
  "Campaña social media inicial",
  "Suscripción catálogo familiar",
  "Paquete contenido premium",
  "Caja regalo corporativa",
  "Centro floral premium",
  "Luz de escritorio profesional",
  "Teclado compacto inalámbrico",
].map((nombre, indice) => ({
  id: 100 + indice,
  nombre,
  proveedor: "Nube Media",
  categoria:
    indice < 2
      ? "Electrónica"
      : indice < 4
        ? "Ropa y accesorios"
        : indice < 6
          ? "Servicios"
          : indice < 8
            ? "Streaming"
            : "Producto físico",
  precio: 16.9 + indice * 9.5,
  minimo: (indice % 3) + 1,
  stock: 20 + indice * 7,
  color: ["#00E5FF", "#FF7A1A", "#39FF6A", "#FFC93C"][indice % 4],
  descripcion: "Referencia mayorista disponible para distribución comercial.",
}));
const carritos = new Map();
const pedidos = [
  {
    id: "IE-1048",
    usuarioId: 1,
    estado: "en_transito",
    progreso: 68,
    total: 214.5,
    fecha: "Hoy, 09:42",
    envio: "Express",
    origen: "Estados Unidos",
    destino: "San Salvador",
  },
];
const eventos = [];
const intentosLogin = new Map();

app.use(cors({ origin: true }));
app.use(express.json());

function autenticar(req, res, siguiente) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    req.usuario = jwt.verify(token, secreto);
    siguiente();
  } catch {
    res.status(401).json({ mensaje: "Sesión no válida" });
  }
}

function emitir(nombre, datos) {
  io.emit(nombre, datos);
}
function exigirRol(...roles) {
  return (req, res, siguiente) =>
    roles.includes(req.usuario.rol)
      ? siguiente()
      : res
          .status(403)
          .json({ mensaje: "No tienes permisos para esta operación" });
}

app.get("/api/salud", async (_, res) =>
  res.json({
    estado: "activo",
    servicio: "Instantly Express API",
    baseDatos: await fnComprobarBaseDatos(),
    tiempo: new Date().toISOString(),
  }),
);
app.post("/api/auth/login", async (req, res) => {
  const ahora = Date.now();
  const intento = intentosLogin.get(req.ip) || { total: 0, inicio: ahora };
  if (ahora - intento.inicio > 900000) {
    intento.total = 0;
    intento.inicio = ahora;
  }
  if (intento.total >= 10)
    return res
      .status(429)
      .json({ mensaje: "Demasiados intentos. Espera unos minutos." });
  intento.total += 1;
  intentosLogin.set(req.ip, intento);
  let usuario = usuarios.find((item) => item.correo === req.body.correo);
  try {
    const filas = await fnConsultarBaseDatos(
      "SELECT id_usuario AS id, nombre, apellidos, correo, contrasena, rol FROM usuarios WHERE correo = ? AND activo = TRUE LIMIT 1",
      [req.body.correo],
    );
    if (filas?.[0]) usuario = filas[0];
  } catch {}
  if (
    !usuario ||
    !(await bcrypt.compare(req.body.contrasena, usuario.contrasena))
  )
    return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
  intentosLogin.delete(req.ip);
  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
    secreto,
    { expiresIn: "8h" },
  );
  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  });
});
app.post("/api/auth/registro", async (req, res) => {
  if (usuarios.some((item) => item.correo === req.body.correo))
    return res.status(409).json({ mensaje: "El correo ya está registrado" });
  const usuario = {
    id: usuarios.length + 1,
    nombre: req.body.nombre,
    apellidos: req.body.apellidos || "",
    correo: req.body.correo,
    contrasena: await bcrypt.hash(req.body.contrasena, 10),
    rol: "cliente",
  };
  try {
    await fnConsultarBaseDatos(
      "INSERT INTO usuarios (nombre, apellidos, telefono, correo, contrasena, pais, rol, activo) VALUES (?, ?, ?, ?, ?, ?, 'cliente', TRUE)",
      [
        usuario.nombre,
        usuario.apellidos,
        req.body.telefono || "00000000",
        usuario.correo,
        usuario.contrasena,
        req.body.pais || "El Salvador",
      ],
    );
  } catch {}
  usuarios.push(usuario);
  res
    .status(201)
    .json({
      mensaje: "Cuenta creada",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
});
app.post("/api/auth/recuperar", (req, res) =>
  res.json({
    mensaje:
      "Si el correo está registrado, recibirás instrucciones para recuperar tu acceso.",
  }),
);
app.get("/api/productos", (req, res) => {
  const busqueda = (req.query.busqueda || "").toLowerCase();
  const categoria = req.query.categoria || "";
  fnConsultarBaseDatos(
    "SELECT p.id_producto AS id, p.nombre, p.descripcion, p.precio_unitario AS precio, p.cantidad_minima_mayoreo AS minimo, p.stock_disponible AS stock, COALESCE(c.nombre, 'Catálogo general') AS categoria, COALESCE(pr.nombre_empresa, 'Proveedor') AS proveedor FROM productos p LEFT JOIN categorias c ON c.id_categoria = p.id_categoria LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor WHERE p.activo = TRUE ORDER BY p.fecha_publicacion DESC",
  )
    .then((filas) => {
      const base = filas?.length ? filas : productos;
      const fuente =
        base.length < 18
          ? [
              ...base,
              ...productosComplementarios.filter(
                (item) => !base.some((actual) => actual.nombre === item.nombre),
              ),
            ]
          : base;
      res.json(
        fuente.filter(
          (item) =>
            (!busqueda ||
              `${item.nombre} ${item.proveedor}`
                .toLowerCase()
                .includes(busqueda)) &&
            (!categoria || item.categoria === categoria),
        ),
      );
    })
    .catch(() =>
      res.json(
        [...productos, ...productosComplementarios].filter(
          (item) =>
            (!busqueda ||
              `${item.nombre} ${item.proveedor}`
                .toLowerCase()
                .includes(busqueda)) &&
            (!categoria || item.categoria === categoria),
        ),
      ),
    );
});
app.get("/api/productos/:id", (req, res) => {
  const producto = productos.find((item) => item.id === Number(req.params.id));
  producto
    ? res.json(producto)
    : res.status(404).json({ mensaje: "Producto no encontrado" });
});
app.get("/api/carrito", autenticar, async (req, res) => {
  const filas = await fnConsultarBaseDatos(
    "SELECT dc.id_detalle_carrito AS idDetalle, dc.id_producto AS idProducto, dc.cantidad FROM carritos c JOIN detalle_carrito dc ON dc.id_carrito = c.id_carrito WHERE c.id_usuario = ?",
    [req.usuario.id],
  ).catch(() => null);
  res.json(filas || carritos.get(req.usuario.id) || []);
});
app.post("/api/carrito/agregar", autenticar, (req, res) => {
  const cantidad = Number(req.body.cantidad);
  let producto = productos.find(
    (item) => item.id === Number(req.body.idProducto),
  );
  const continuar = async () => {
    if (!producto) {
      const filas = await fnConsultarBaseDatos(
        "SELECT id_producto AS id, nombre, precio_unitario AS precio, cantidad_minima_mayoreo AS minimo, stock_disponible AS stock FROM productos WHERE id_producto = ? AND activo = TRUE LIMIT 1",
        [req.body.idProducto],
      ).catch(() => []);
      producto = filas?.[0];
    }
    if (!producto)
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    if (!producto)
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    if (cantidad < producto.minimo)
      return res
        .status(422)
        .json({
          mensaje: `El mínimo de mayoreo es ${producto.minimo} unidades`,
        });
    if (cantidad > producto.stock) {
      const evento = {
        producto: producto.nombre,
        accion: "stock_insuficiente",
        cantidad,
        stock: producto.stock,
        fecha: new Date().toISOString(),
      };
      eventos.unshift(evento);
      emitir("monitoreo:evento_carrito", evento);
      return res
        .status(422)
        .json({
          mensaje: `Stock insuficiente. Disponibles: ${producto.stock}`,
        });
    }
    const carrito = carritos.get(req.usuario.id) || [];
    const existente = carrito.find((item) => item.idProducto === producto.id);
    if (existente) existente.cantidad += cantidad;
    else
      carrito.push({
        idDetalle: `${req.usuario.id}-${producto.id}`,
        idProducto: producto.id,
        cantidad,
      });
    carritos.set(req.usuario.id, carrito);
    await fnTransaccionBaseDatos(async (conexion) => {
      const [carritosDb] = await conexion.query(
        "INSERT INTO carritos (id_usuario) VALUES (?) ON DUPLICATE KEY UPDATE id_carrito = LAST_INSERT_ID(id_carrito)",
        [req.usuario.id],
      );
      const idCarrito = carritosDb.insertId;
      await conexion.query(
        "INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)",
        [idCarrito, producto.id, cantidad],
      );
    }).catch(() => null);
    const evento = {
      producto: producto.nombre,
      accion: "agregado",
      cantidad,
      stock: producto.stock,
      fecha: new Date().toISOString(),
    };
    eventos.unshift(evento);
    emitir("carrito:actualizado", {
      idProducto: producto.id,
      stockDisponible: producto.stock,
      accion: "agregado",
    });
    emitir("monitoreo:evento_carrito", evento);
    res.status(201).json(carrito);
  };
  continuar().catch((error) =>
    res
      .status(500)
      .json({
        mensaje: "No fue posible agregar el producto",
        detalle: error.message,
      }),
  );
});
app.delete("/api/carrito/:id", autenticar, async (req, res) => {
  const carrito = (carritos.get(req.usuario.id) || []).filter(
    (item) => item.idDetalle !== req.params.id,
  );
  carritos.set(req.usuario.id, carrito);
  await fnConsultarBaseDatos(
    "DELETE dc FROM detalle_carrito dc JOIN carritos c ON c.id_carrito = dc.id_carrito WHERE dc.id_detalle_carrito = ? AND c.id_usuario = ?",
    [req.params.id, req.usuario.id],
  ).catch(() => null);
  res.json(carrito);
});
app.post("/api/pedidos", autenticar, async (req, res) => {
  const carrito = carritos.get(req.usuario.id) || [];
  if (!carrito.length)
    return res.status(422).json({ mensaje: "El carrito está vacío" });
  let total = 0;
  carrito.forEach((linea) => {
    const producto = productos.find((item) => item.id === linea.idProducto);
    producto.stock -= linea.cantidad;
    total += producto.precio * linea.cantidad;
  });
  const metodosPermitidos = [
    "Tarjeta",
    "Transferencia bancaria",
    "Pago contra entrega",
  ];
  const metodoPago = metodosPermitidos.includes(req.body.metodoPago)
    ? req.body.metodoPago
    : "Transferencia bancaria";
  const pedido = {
    id: `IE-${1048 + pedidos.length}`,
    usuarioId: req.usuario.id,
    estado: "pendiente",
    progreso: 0,
    total,
    fecha: "Ahora",
    envio: req.body.tipoEnvio || "Estándar",
    metodoPago,
    origen: "Estados Unidos",
    destino: req.body.destino || "Por confirmar",
  };
  try {
    await fnTransaccionBaseDatos(async (conexion) => {
      const [direcciones] = await conexion.query(
        "SELECT id_direccion FROM direcciones_envio WHERE id_usuario = ? ORDER BY predeterminada DESC, id_direccion ASC LIMIT 1",
        [req.usuario.id],
      );
      let idDireccion = direcciones[0]?.id_direccion;
      if (!idDireccion) {
        const [nuevaDireccion] = await conexion.query(
          "INSERT INTO direcciones_envio (id_usuario, pais, ciudad, direccion_completa, predeterminada) VALUES (?, 'El Salvador', ?, ?, TRUE)",
          [
            req.usuario.id,
            req.body.ciudad || "San Salvador",
            req.body.destino || "Por confirmar",
          ],
        );
        idDireccion = nuevaDireccion.insertId;
      }
      const [envios] = await conexion.query(
        "SELECT id_tipo_envio FROM tipos_envio WHERE nombre = ? LIMIT 1",
        [pedido.envio],
      );
      const idTipoEnvio = envios[0]?.id_tipo_envio || 1;
      const [nuevoPedido] = await conexion.query(
        "INSERT INTO pedidos (id_usuario, id_direccion, id_tipo_envio, metodo_pago_elegido, monto_total, estado) VALUES (?, ?, ?, ?, ?, ?)",
        [
          req.usuario.id,
          idDireccion,
          idTipoEnvio,
          metodoPago,
          total,
          "pendiente",
        ],
      );
      const idPedido = nuevoPedido.insertId;
      const [lineas] = await conexion.query(
        "SELECT dc.id_producto, dc.cantidad, p.id_proveedor, p.precio_unitario FROM detalle_carrito dc JOIN carritos c ON c.id_carrito = dc.id_carrito JOIN productos p ON p.id_producto = dc.id_producto WHERE c.id_usuario = ?",
        [req.usuario.id],
      );
      for (const linea of lineas) {
        await conexion.query(
          "UPDATE productos SET stock_disponible = stock_disponible - ? WHERE id_producto = ? AND stock_disponible >= ?",
          [linea.cantidad, linea.id_producto, linea.cantidad],
        );
        await conexion.query(
          "INSERT INTO detalle_pedidos (id_pedido, id_producto, id_proveedor, cantidad, precio_unitario_congelado) VALUES (?, ?, ?, ?, ?)",
          [
            idPedido,
            linea.id_producto,
            linea.id_proveedor,
            linea.cantidad,
            linea.precio_unitario,
          ],
        );
      }
      await conexion.query(
        "INSERT INTO seguimiento_pedidos (id_pedido, estado_actual, porcentaje_avance, fecha_estimada_entrega) VALUES (?, ?, 0, DATE_ADD(CURRENT_DATE(), INTERVAL 4 DAY))",
        [idPedido, "pendiente"],
      );
      await conexion.query(
        "DELETE dc FROM detalle_carrito dc JOIN carritos c ON c.id_carrito = dc.id_carrito WHERE c.id_usuario = ?",
        [req.usuario.id],
      );
    });
  } catch (error) {
    // Si la base de datos falla, igual crea el pedido local para no bloquear + factura.
    try {
      const pedidoLocal = {
        id: `IE-${(1048 + pedidos.length).toString()}`,
        usuarioId: req.usuario.id,
        estado: "pendiente",
        progreso: 0,
        total,
        fecha: "Ahora",
        envio: req.body.tipoEnvio || "Estándar",
        metodoPago,
        origen: "Estados Unidos",
        destino: req.body.destino || "Por confirmar",
      };
      pedidos.unshift(pedidoLocal);
      carritos.set(req.usuario.id, []);
      emitir("pedido:actualizado", pedidoLocal);
      return res.status(201).json(pedidoLocal);
    } catch {}
    return res
      .status(503)
      .json({
        mensaje: "No fue posible guardar el pedido en la base de datos",
        detalle: error.message,
      });
  }
  pedidos.unshift(pedido);
  carritos.set(req.usuario.id, []);
  emitir("pedido:actualizado", pedido);
  res.status(201).json(pedido);
});
app.get("/api/pedidos", autenticar, async (req, res) => {
  const filas = await fnConsultarBaseDatos(
    "SELECT CONCAT('IE-', p.id_pedido) AS id, p.id_usuario AS usuarioId, p.estado, COALESCE(s.porcentaje_avance, 0) AS progreso, p.monto_total AS total, p.fecha_pedido AS fecha, te.nombre AS envio, 'Estados Unidos' AS origen, CONCAT(d.ciudad, ', ', d.pais) AS destino, p.metodo_pago_elegido AS metodoPago FROM pedidos p JOIN tipos_envio te ON te.id_tipo_envio = p.id_tipo_envio JOIN direcciones_envio d ON d.id_direccion = p.id_direccion LEFT JOIN seguimiento_pedidos s ON s.id_pedido = p.id_pedido WHERE (? = 'admin' OR p.id_usuario = ?) ORDER BY p.id_pedido DESC",
    [req.usuario.rol, req.usuario.id],
  ).catch(() => null);
  res.json(
    filas?.length
      ? filas
      : req.usuario.rol === "admin"
        ? pedidos
        : pedidos.filter((item) => item.usuarioId === req.usuario.id),
  );
});
app.get("/api/seguimiento/activos", autenticar, (req, res) =>
  res.json(
    pedidos.filter((item) =>
      ["confirmado", "en_transito"].includes(item.estado),
    ),
  ),
);
app.get("/api/monitoreo/carrito", autenticar, (req, res) =>
  req.usuario.rol === "admin"
    ? res.json(eventos.slice(0, 30))
    : res.status(403).json({ mensaje: "Acceso restringido" }),
);
app.get(
  "/api/admin/proveedores",
  autenticar,
  exigirRol("admin"),
  async (req, res) => {
    const filas = await fnConsultarBaseDatos(
      "SELECT id_proveedor AS id, nombre_empresa AS empresa, pais_origen AS pais, estado_aprobacion AS estado FROM proveedores ORDER BY fecha_solicitud DESC",
    ).catch(() => null);
    res.json(filas || []);
  },
);
app.put(
  "/api/admin/proveedores/:id/aprobar",
  autenticar,
  exigirRol("admin"),
  async (req, res) => {
    const estado = ["aprobado", "rechazado", "pendiente"].includes(
      req.body.estado,
    )
      ? req.body.estado
      : "pendiente";
    await fnConsultarBaseDatos(
      "UPDATE proveedores SET estado_aprobacion = ? WHERE id_proveedor = ?",
      [estado, req.params.id],
    ).catch(() => null);
    res.json({ id: req.params.id, estado });
  },
);
app.get(
  "/api/admin/reportes",
  autenticar,
  exigirRol("admin", "proveedor"),
  async (req, res) => {
    const filas = await fnConsultarBaseDatos(
      "SELECT COUNT(*) AS pedidos, COALESCE(SUM(monto_total), 0) AS ventas, SUM(estado = 'en_transito') AS en_transito, SUM(estado = 'entregado') AS entregados FROM pedidos",
    ).catch(() => null);
    res.json(
      filas?.[0] || {
        pedidos: pedidos.length,
        ventas: pedidos.reduce((total, item) => total + item.total, 0),
        en_transito: pedidos.filter((item) => item.estado === "en_transito")
          .length,
        entregados: pedidos.filter((item) => item.estado === "entregado")
          .length,
      },
    );
  },
);
app.put(
  "/api/pedidos/:id/estado",
  autenticar,
  exigirRol("admin", "proveedor"),
  (req, res) => {
    const pedido = pedidos.find((item) => item.id === req.params.id);
    const transiciones = {
      pendiente: ["confirmado", "cancelado"],
      confirmado: ["en_transito", "cancelado"],
      en_transito: ["entregado", "cancelado"],
      entregado: [],
      cancelado: [],
    };
    if (!pedido || !transiciones[pedido.estado]?.includes(req.body.estado))
      return res
        .status(422)
        .json({ mensaje: "Transición de estado no permitida" });
    pedido.estado = req.body.estado;
    if (pedido.estado === "entregado") pedido.progreso = 100;
    emitir("pedido:actualizado", pedido);
    res.json(pedido);
  },
);
io.on("connection", (socket) =>
  socket.emit("conexion:lista", { conectado: true }),
);

const puerto = process.env.PORT || process.env.PUERTO || 4000;
if (process.env.NODE_ENV !== "test")
  setInterval(
    () =>
      pedidos
        .filter((item) => item.estado === "en_transito")
        .forEach((item) => {
          item.progreso = Math.min(95, item.progreso + 1);
          emitir("pedido:actualizado", item);
        }),
    120000,
  );
if (process.env.NODE_ENV !== "test")
  servidor.listen(puerto, () =>
    console.log(`Instantly Express API en http://localhost:${puerto}`),
  );
export { app, servidor };
