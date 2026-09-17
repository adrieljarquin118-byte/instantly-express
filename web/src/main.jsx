import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import "./styles.css";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:4010/api"
).replace(/\/$/, "");
const logo = "/logo.png";
const portadaLogin = "/portada.png";
const iso = "/logo.png";
const placeholderJpg = "/portada.png";
const IMAGEN_POR_DEFECTO =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=60";
function fnImagenProducto(item) {
  if (item?.imagen) return item.imagen;
  const categoria = String(item?.categoria || "").toLowerCase();
  if (categoria.includes("stream")) return IMAGENES_DEMO.streaming;
  if (categoria.includes("electr")) return IMAGENES_DEMO.electronica;
  if (categoria.includes("fisico") || categoria.includes("físico"))
    return IMAGENES_DEMO.fisico;
  if (
    categoria.includes("ropa") ||
    categoria.includes("accesor") ||
    categoria.includes("urbano")
  )
    return IMAGENES_DEMO.ropa;
  if (categoria.includes("serv")) return IMAGENES_DEMO.servicios;
  return IMAGEN_POR_DEFECTO;
}
function ImagenSegura({ src, alt, className }) {
  const [origen, setOrigen] = useState(src || IMAGEN_POR_DEFECTO);
  useEffect(() => {
    setOrigen(src || IMAGEN_POR_DEFECTO);
  }, [src]);
  return (
    <img
      src={origen}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (origen !== IMAGEN_POR_DEFECTO) setOrigen(IMAGEN_POR_DEFECTO);
      }}
    />
  );
}
function Icono({ children }) {
  return <span className="icon-box">{children}</span>;
}
const Home = (props) => <Icono {...props}>IN</Icono>;
const LayoutGrid = (props) => <Icono {...props}>CA</Icono>;
const ShoppingCart = (props) => <Icono {...props}>CO</Icono>;
const ClipboardList = (props) => <Icono {...props}>PE</Icono>;
const MapPinned = (props) => <Icono {...props}>TR</Icono>;
const UserRound = (props) => <Icono {...props}>US</Icono>;
const Search = (props) => <Icono {...props}>?</Icono>;
const LogOut = (props) => <Icono {...props}>S</Icono>;
const Info = (props) => <Icono {...props}>i</Icono>;
const Globe2 = (props) => <Icono {...props}>GL</Icono>;
const Camera = (props) => <Icono {...props}>F</Icono>;
const Package = (props) => <Icono {...props}>PK</Icono>;
const X = (props) => <Icono {...props}>X</Icono>;
const iconosMenu = {
  inicio: Home,
  catalogo: LayoutGrid,
  carrito: ShoppingCart,
  pedidos: ClipboardList,
  seguimiento: MapPinned,
  perfil: UserRound,
};
const traducciones = {
  es: {
    inicio: "Inicio",
    catalogo: "Catalogo",
    carrito: "Carrito",
    pedidos: "Pedidos",
    seguimiento: "Seguimiento",
    perfil: "Perfil",
  },
  en: {
    inicio: "Home",
    catalogo: "Catalog",
    carrito: "Cart",
    pedidos: "Orders",
    seguimiento: "Tracking",
    perfil: "Profile",
  },
  pt: {
    inicio: "Inicio",
    catalogo: "Catalogo",
    carrito: "Carrinho",
    pedidos: "Pedidos",
    seguimiento: "Rastreamento",
    perfil: "Perfil",
  },
};
const IMAGENES_DEMO = {
  streaming:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60",
  electronica:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=60",
  fisico:
    "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=60",
  ropa: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=60",
  servicios:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
};
const CATALOGO_DEMO = [
  {
    id: 1,
    nombre: "Catálogo Stream Premium",
    proveedor: "Nube Media",
    categoria: "Streaming",
    precio: 18.5,
    minimo: 5,
    stock: 86,
    color: "#00E5FF",
    imagen: IMAGENES_DEMO.streaming,
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
    imagen: IMAGENES_DEMO.electronica,
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
    imagen: IMAGENES_DEMO.fisico,
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
    imagen: IMAGENES_DEMO.ropa,
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
    imagen: IMAGENES_DEMO.servicios,
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
    imagen: IMAGENES_DEMO.electronica,
    descripcion: "Audio cerrado para streaming, edición y monitoreo.",
  },
];

function fnEscaparPdf(texto) {
  return String(texto)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}
function fnDescargarFactura(pedido) {
  const lineas = [
    `INSTANTLY EXPRESS`,
    `FACTURA DE PEDIDO`,
    `Pedido: ${pedido.id}`,
    `Fecha: ${pedido.fecha}`,
    `Origen: Estados Unidos`,
    `Destino: ${pedido.destino}`,
    `Metodo de pago: ${pedido.metodoPago || "Transferencia bancaria"}`,
    `Total: $${Number(pedido.total).toFixed(2)}`,
    `Documento informativo. No representa un cobro real.`,
  ];
  let contenido = "BT\n/F1 16 Tf\n50 780 Td\n";
  lineas.forEach((linea, indice) => {
    contenido += `(${fnEscaparPdf(linea)}) Tj\n${indice === 1 ? "0 -28 Td\n/F1 11 Tf\n" : "0 -22 Td\n"}`;
  });
  contenido += "ET";
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objetos.forEach((objeto, indice) => {
    offsets.push(pdf.length);
    pdf += `${indice + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const inicio = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicio}\n%%EOF`;
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(
    new Blob([pdf], { type: "application/pdf" }),
  );
  enlace.download = `factura-${pedido.id}.pdf`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

async function fnPedir(ruta, token, opciones = {}) {
  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const datos = await respuesta.json();
  if (!respuesta.ok)
    throw new Error(datos.mensaje || "No se pudo completar la operacion");
  return datos;
}

function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("ie_usuario") || "null"),
  );
  const [token, setToken] = useState(localStorage.getItem("ie_token") || "");
  const [vista, setVista] = useState("inicio");
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [aviso, setAviso] = useState("");
  const [enVivo, setEnVivo] = useState(false);
  const [tema, setTema] = useState(localStorage.getItem("ie_tema") || "oscuro");
  const [idioma, setIdioma] = useState(
    localStorage.getItem("ie_idioma") || "es",
  );
  const [productoDetalle, setProductoDetalle] = useState(null);

  useEffect(() => {
    setProductos(CATALOGO_DEMO);
    fnPedir("/productos", token)
      .then((datos) => {
        if (Array.isArray(datos) && datos.length > 0) {
          setProductos(
            datos.map((item) => ({
              ...item,
              imagen: item.imagen || fnImagenProducto(item),
            }))
          );
          setAviso("");
        }
      })
      .catch((error) => {
        if (String(error.message || "").includes("Failed to fetch"))
          setAviso(
            "Sin conexión al backend: mostrando catálogo demo. Revisa VITE_API_URL en Railway."
          );
        else setAviso(error.message);
      });
  }, [token]);
  useEffect(() => {
    if (!token) return undefined;
    fnPedir("/carrito", token)
      .then(setCarrito)
      .catch(() => {});
    fnPedir("/pedidos", token)
      .then(setPedidos)
      .catch(() => {});
    const socket = io(API.replace(/\/api$/, ""));
    socket.on("connect", () => setEnVivo(true));
    socket.on("disconnect", () => setEnVivo(false));
    socket.on("carrito:actualizado", (evento) =>
      setAviso(
        `Existencias actualizadas: ${evento.stockDisponible} disponibles`,
      ),
    );
    socket.on("pedido:actualizado", (pedido) =>
      setPedidos((actuales) => [
        pedido,
        ...actuales.filter((item) => item.id !== pedido.id),
      ]),
    );
    return () => socket.disconnect();
  }, [token]);

  function fnSesion(datos) {
    setToken(datos.token);
    setUsuario(datos.usuario);
    localStorage.setItem("ie_token", datos.token);
    localStorage.setItem("ie_usuario", JSON.stringify(datos.usuario));
  }
  async function fnAgregar(producto) {
    try {
      setCarrito(
        await fnPedir("/carrito/agregar", token, {
          method: "POST",
          body: JSON.stringify({
            idProducto: producto.id,
            cantidad: producto.minimo,
          }),
        }),
      );
      setAviso(`${producto.nombre} agregado al carrito`);
    } catch (error) {
      setAviso(error.message);
    }
  }
  async function fnConfirmar(metodoPago = "Transferencia bancaria") {
    try {
      const elegido = [
        "Tarjeta",
        "Transferencia bancaria",
        "Pago contra entrega",
      ].includes(metodoPago)
        ? metodoPago
        : "Transferencia bancaria";
      const pedido = await fnPedir("/pedidos", token, {
        method: "POST",
        body: JSON.stringify({
          tipoEnvio: "Express",
          metodoPago: elegido,
          destino: "San Salvador",
        }),
      });
      setPedidos((actuales) => [pedido, ...actuales]);
      setCarrito([]);
      fnDescargarFactura(pedido);
      setVista("pedidos");
      setAviso("Pedido creado. La factura PDF se descargó.");
    } catch (error) {
      setAviso(error.message);
    }
  }
  function fnSalir() {
    localStorage.clear();
    setToken("");
    setUsuario(null);
  }
  function fnCambiarTema(nuevoTema) {
    setTema(nuevoTema);
    localStorage.setItem("ie_tema", nuevoTema);
  }
  function fnCambiarIdioma(nuevoIdioma) {
    setIdioma(nuevoIdioma);
    localStorage.setItem("ie_idioma", nuevoIdioma);
    document.documentElement.lang = nuevoIdioma;
  }
  {
    vista === "seguimiento" && <SeguimientoInteractivo pedidos={pedidos} />;
  }

  if (!token) return <Acceso onLogin={fnSesion} />;
  const filtrados = productos.filter((item) =>
    `${item.nombre} ${item.proveedor} ${item.categoria}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );
  const idiomaActual = traducciones[idioma] || traducciones.es;
  const menu = [
    ["inicio", idiomaActual.inicio],
    ["catalogo", idiomaActual.catalogo],
    [
      "carrito",
      `${idiomaActual.carrito}${carrito.length ? ` (${carrito.length})` : ""}`,
    ],
    ["pedidos", idiomaActual.pedidos],
    ["seguimiento", idiomaActual.seguimiento],
    ["perfil", idiomaActual.perfil],
  ];
  return (
    <div className={`app-shell tema-${tema}`}>
      <aside className="sidebar">
        <div className="brand">
          <img src={iso} alt="Instantly Express" />
          <span>IE</span>
        </div>
        <nav>
          {menu.map(([id, texto]) => {
            const Icono = iconosMenu[id];
            return (
              <button
                className={vista === id ? "nav-active" : ""}
                onClick={() => setVista(id)}
                key={id}
              >
                <b>
                  <Icono size={18} />
                </b>
                {texto}
              </button>
            );
          })}
        </nav>
        <div className="side-footer">
          <span className={enVivo ? "live-dot" : "offline-dot"} />
          {enVivo ? "Conectado" : "Sin conexion"}
        </div>
      </aside>
      <main>
        <header>
          <div className="mobile-brand">
            <img src={iso} alt="IE" />
            <strong>Instantly Express</strong>
          </div>
          <div className="search">
            <Search size={17} />
            <input
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value);
                setVista("catalogo");
              }}
              placeholder="Buscar productos o proveedores"
            />
          </div>
          <div className="user">
            <span className="avatar">{usuario.nombre[0]}</span>
            <div>
              <strong>{usuario.nombre}</strong>
              <small>{usuario.rol}</small>
            </div>
            <button className="logout" onClick={fnSalir} title="Cerrar sesion">
              <LogOut size={17} />
            </button>
          </div>
        </header>
        {aviso && (
          <div className="toast" onClick={() => setAviso("")}>
            {aviso}
            <X size={15} />
          </div>
        )}
        <section className="content">
          {vista === "inicio" && (
            <Inicio usuario={usuario} pedidos={pedidos} ir={setVista} />
          )}
          {vista === "catalogo" && (
            <Catalogo
              productos={filtrados}
              agregar={fnAgregar}
              detalle={setProductoDetalle}
            />
          )}
          {vista === "carrito" && (
            <Carrito
              carrito={carrito}
              productos={productos}
              confirmar={fnConfirmar}
            />
          )}
          {vista === "pedidos" && <Pedidos pedidos={pedidos} ir={setVista} />}
          {vista === "seguimiento" && <Seguimiento pedidos={pedidos} />}
          {vista === "perfil" && (
            <Perfil
              usuario={usuario}
              tema={tema}
              cambiarTema={fnCambiarTema}
              idioma={idioma}
              cambiarIdioma={fnCambiarIdioma}
              salir={fnSalir}
            />
          )}
        </section>
        {productoDetalle && (
          <DetalleProducto
            producto={productoDetalle}
            agregar={fnAgregar}
            cerrar={() => setProductoDetalle(null)}
          />
        )}
      </main>
    </div>
  );
}

function Acceso({ onLogin }) {
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  return (
    <div>
      <Login onLogin={onLogin} />
      <button
        className="forgot-link"
        onClick={() => setMostrarRecuperacion(true)}
      >
        ¿Olvidaste tu contraseña?
      </button>
      <button
        className="access-switch"
        onClick={() => setMostrarRegistro(true)}
      >
        Crear una cuenta
      </button>
      {mostrarRegistro && (
        <Registro onLogin={onLogin} cerrar={() => setMostrarRegistro(false)} />
      )}
      {mostrarRecuperacion && (
        <Recuperar cerrar={() => setMostrarRecuperacion(false)} />
      )}
    </div>
  );
}
function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  async function fnEntrar(event) {
    event.preventDefault();
    setError("");
    try {
      onLogin(
        await fnPedir("/auth/login", "", {
          method: "POST",
          body: JSON.stringify({ correo, contrasena }),
        }),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-panel">
          <img src={logo} alt="Instantly Express" />
        </div>
        <form onSubmit={fnEntrar}>
          <p className="eyebrow">CENTRO DE OPERACIONES</p>
          <h1>Acceso a tu red comercial</h1>
          <p className="muted">
            Gestiona catalogos, pedidos y entregas desde un solo lugar.
          </p>
          <label>
            Correo
            <input
              required
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </label>
          <label className="login-field password-field">
            Contraseña
            <input
              required
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="primary full">Iniciar sesion</button>
        </form>
      </div>
    </div>
  );
}
function Registro({ onLogin, cerrar }) {
  const [formulario, setFormulario] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    contrasena: "",
  });
  const [error, setError] = useState("");
  async function fnRegistrar(event) {
    event.preventDefault();
    try {
      await fnPedir("/auth/registro", "", {
        method: "POST",
        body: JSON.stringify(formulario),
      });
      onLogin(
        await fnPedir("/auth/login", "", {
          method: "POST",
          body: JSON.stringify({
            correo: formulario.correo,
            contrasena: formulario.contrasena,
          }),
        }),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="register-layer">
      <div className="register-card">
        <button className="close-register" onClick={cerrar}>
          x
        </button>
        <p className="eyebrow">NUEVA CUENTA</p>
        <h2>unete a la red mayorista</h2>
        <form onSubmit={fnRegistrar}>
          <label>
            Nombre
            <input
              required
              value={formulario.nombre}
              onChange={(e) =>
                setFormulario({ ...formulario, nombre: e.target.value })
              }
            />
          </label>
          <label>
            Apellidos
            <input
              required
              value={formulario.apellidos}
              onChange={(e) =>
                setFormulario({ ...formulario, apellidos: e.target.value })
              }
            />
          </label>
          <label>
            Correo
            <input
              required
              type="email"
              value={formulario.correo}
              onChange={(e) =>
                setFormulario({ ...formulario, correo: e.target.value })
              }
            />
          </label>
          <label>
            Contraseña
            <input
              required
              minLength="6"
              type="password"
              value={formulario.contrasena}
              onChange={(e) =>
                setFormulario({ ...formulario, contrasena: e.target.value })
              }
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="primary full">Crear cuenta</button>
        </form>
      </div>
    </div>
  );
}

function Recuperar({ cerrar }) {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  async function fnSolicitar(event) {
    event.preventDefault();
    try {
      const respuesta = await fnPedir("/auth/recuperar", "", {
        method: "POST",
        body: JSON.stringify({ correo }),
      });
      setMensaje(respuesta.mensaje);
    } catch (error) {
      setMensaje(error.message);
    }
  }
  return (
    <div className="modal-layer">
      <div className="register-card">
        <button className="close-register" onClick={cerrar}>
          <X size={20} />
        </button>
        <p className="eyebrow">RECUPERAR ACCESO</p>
        <h2>Restablece tu contraseña</h2>
        <p className="muted">
          Escribe tu correo y te mostraremos los siguientes pasos.
        </p>
        <form onSubmit={fnSolicitar}>
          <label>
            Correo
            <input
              required
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
            />
          </label>
          {mensaje && <p className="success-message">{mensaje}</p>}
          <button className="primary full">Solicitar instrucciones</button>
        </form>
      </div>
    </div>
  );
}

function Inicio({ usuario, pedidos, ir }) {
  const activos = pedidos.filter((item) => item.estado !== "entregado").length;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PANEL DE CONTROL / {usuario.rol}</p>
          <h1>Buenos dias, {usuario.nombre}</h1>
          <p className="muted">
            Tu operacion mayorista, clara y en movimiento.
          </p>
        </div>
        <span className="date-chip">
          OPERACION ACTIVA <i className="live-dot" />
        </span>
      </div>
      <div className="kpis">
        <Kpi label="Pedidos activos" value={activos || "00"} accent="cyan" />
        <Kpi
          label="En transito"
          value={
            pedidos.filter((item) => item.estado === "en_transito").length ||
            "00"
          }
          accent="orange"
        />
        <Kpi label="Entregados" value="12" accent="green" />
        <Kpi label="Alertas de stock" value="03" accent="yellow" />
      </div>
      <div className="dashboard-grid">
        <div className="panel tracking-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">MONITOREO EN VIVO</p>
              <h2>Pedidos en transito</h2>
            </div>
            <button className="ghost" onClick={() => ir("pedidos")}>
              Ver pedidos
            </button>
          </div>
          {pedidos
            .filter((item) => item.estado === "en_transito")
            .map((pedido) => (
              <Shipment key={pedido.id} pedido={pedido} />
            ))}
          {!pedidos.some((item) => item.estado === "en_transito") && (
            <p className="muted">No hay envios en transito ahora.</p>
          )}
        </div>
        <div className="panel quick-panel">
          <p className="eyebrow">ACCESOS RAPIDOS</p>
          <h2>Que necesitas mover?</h2>
          <button className="quick-action" onClick={() => ir("catalogo")}>
            <span>CA</span>
            <div>
              <strong>Explorar catalogo</strong>
              <small>Encuentra referencias disponibles</small>
            </div>
            <b>-&gt;</b>
          </button>
          <button className="quick-action" onClick={() => ir("seguimiento")}>
            <span>TR</span>
            <div>
              <strong>Ver seguimiento</strong>
              <small>Consulta la ruta estimada</small>
            </div>
            <b>-&gt;</b>
          </button>
        </div>
      </div>
    </>
  );
}
function Kpi({ label, value, accent }) {
  return (
    <div className={`kpi ${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Actualizado ahora</small>
    </div>
  );
}
function Shipment({ pedido }) {
  return (
    <div className="shipment">
      <div className="route">
        <span className="route-line" />
        <span className="route-start">ORIGEN</span>
        <span className="route-truck">â–°</span>
        <span className="route-end">DESTINO</span>
      </div>
      <div className="shipment-info">
        <strong>{pedido.id}</strong>
        <span>
          {pedido.envio} Â· {pedido.destino}
        </span>
        <b>{pedido.progreso}%</b>
      </div>
      <div className="progress">
        <i style={{ width: `${pedido.progreso}%` }} />
      </div>
    </div>
  );
}
function Catalogo({ productos, agregar, detalle }) {
  const [categoria, setCategoria] = useState("Todas");
  const categorias = [
    "Todas",
    ...new Set(productos.map((item) => item.categoria)),
  ];
  const visibles =
    categoria === "Todas"
      ? productos
      : productos.filter((item) => item.categoria === categoria);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">INVENTARIO MULTIPROVEEDOR</p>
          <h1>Catalogo</h1>
          <p className="muted">
            Compra por volumen con existencias actualizadas.
          </p>
        </div>
        <span className="result-count">{visibles.length} referencias</span>
      </div>
      <div className="filters">
        {categorias.map((item) => (
          <button
            className={categoria === item ? "filter-active" : ""}
            onClick={() => setCategoria(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {visibles.map((producto) => (
          <article className="product-card" key={producto.id}>
            <div
              className="product-art"
              style={{ "--accent": producto.color || "#00E5FF" }}
            >
              <ImagenSegura
                src={fnImagenProducto(producto)}
                alt={producto.nombre}
                className="product-foto"
              />
              <div className="product-art-overlay">
                <span>{producto.categoria.slice(0, 3).toUpperCase()}</span>
                <strong>{producto.proveedor}</strong>
              </div>
            </div>
            <div className="product-body">
              <div className="product-meta">
                <span>{producto.proveedor}</span>
                <em>disponible</em>
              </div>
              <h3>{producto.nombre}</h3>
              <p>{producto.descripcion}</p>
              <div className="product-bottom">
                <div>
                  <b>${Number(producto.precio).toFixed(2)}</b>
                  <small>min. {producto.minimo} unidades</small>
                </div>
                <div className="product-actions">
                  <button
                    className="info-btn"
                    onClick={() => detalle(producto)}
                    title="Mas informacion"
                  >
                    <Info size={15} />
                  </button>
                  <button
                    className="add-btn"
                    onClick={() => agregar(producto)}
                    title="Agregar al carrito"
                  >
                    <ShoppingCart size={17} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function DetalleProducto({ producto, agregar, cerrar }) {
  return (
    <div className="modal-layer">
      <div className="detail-modal">
        <button className="close-register" onClick={cerrar}>
          <X size={20} />
        </button>
        <div className="detail-art detail-art-foto">
          <ImagenSegura
            src={fnImagenProducto(producto)}
            alt={producto.nombre}
            className="detail-main-foto"
          />
        </div>
        <p className="eyebrow">DETALLE DE PRODUCTO</p>
        <h2>{producto.nombre}</h2>
        <p className="muted">Proveedor: {producto.proveedor}</p>
        <p>{producto.descripcion}</p>
        <div className="detail-row">
          <strong>${Number(producto.precio).toFixed(2)}</strong>
          <span>Stock: {producto.stock}</span>
          <span>Minimo: {producto.minimo}</span>
        </div>
        <button
          className="primary full"
          onClick={() => {
            agregar(producto);
            cerrar();
          }}
        >
          <ShoppingCart size={16} /> Agregar al carrito
        </button>
      </div>
    </div>
  );
}
function Carrito({ carrito, productos, confirmar }) {
  const [metodoPago, setMetodoPago] = useState("Transferencia bancaria");
  const lineas = carrito
    .map((linea) => ({
      ...linea,
      producto: productos.find((item) => item.id === linea.idProducto),
    }))
    .filter((item) => item.producto);
  const total = lineas.reduce(
    (suma, item) => suma + item.cantidad * item.producto.precio,
    0,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESERVA DE EXISTENCIAS</p>
          <h1>Tu carrito</h1>
          <p className="muted">Cada linea se valida antes de confirmar.</p>
        </div>
      </div>
      {!lineas.length ? (
        <div className="empty panel">
          <span>+</span>
          <h2>Tu carrito esta vacio</h2>
          <p className="muted">Agrega referencias desde el catalogo.</p>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="panel cart-list">
            {lineas.map((linea) => (
              <div className="cart-line" key={linea.idDetalle}>
                <div className="mini-art mini-art-foto">
                  <ImagenSegura
                    src={fnImagenProducto(linea.producto)}
                    alt={linea.producto.nombre}
                    className="mini-foto"
                  />
                </div>
                <div>
                  <strong>{linea.producto.nombre}</strong>
                  <small>
                    {linea.producto.proveedor} - {linea.cantidad} unidades
                  </small>
                </div>
                <b>${(linea.cantidad * linea.producto.precio).toFixed(2)}</b>
                <span className="stock-ok">validado</span>
              </div>
            ))}
          </div>
          <aside className="panel checkout">
            <p className="eyebrow">RESUMEN</p>
            <div>
              <span>Subtotal</span>
              <b>${total.toFixed(2)}</b>
            </div>
            <div>
              <span>Envio express</span>
              <b>$18.50</b>
            </div>
            <label className="payment-label">
              Metodo de pago
              <select
                value={metodoPago}
                onChange={(event) => setMetodoPago(event.target.value)}
              >
                <option>Transferencia bancaria</option>
                <option>Tarjeta</option>
                <option>Pago contra entrega</option>
              </select>
            </label>
            <hr />
            <div className="total">
              <span>Total estimado</span>
              <strong>${(total + 18.5).toFixed(2)}</strong>
            </div>
            <button
              className="primary full"
              onClick={() => confirmar(metodoPago)}
            >
              Confirmar pedido -&gt;
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
function Pedidos({ pedidos, ir }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">HISTORIAL DE PEDIDOS</p>
          <h1>Mis pedidos</h1>
          <p className="muted">Consulta tus compras, estados y entregas.</p>
        </div>
        <button className="primary" onClick={() => ir("seguimiento")}>
          Ver seguimiento
        </button>
      </div>
      <div className="history-tabs">
        <button className="filter-active">Todos</button>
        <button>En proceso</button>
        <button>Entregados</button>
      </div>
      <div className="orders-list">
        {pedidos.map((pedido) => (
          <article className="panel order-card" key={pedido.id}>
            <div className="order-icon">IE</div>
            <div className="order-main">
              <div>
                <strong>{pedido.id}</strong>
                <span className={`status ${pedido.estado}`}>
                  {pedido.estado.replace("_", " ")}
                </span>
              </div>
              <p>
                Origen: Estados Unidos · Destino: {pedido.destino} ·{" "}
                {pedido.fecha}
              </p>
              <div className="progress">
                <i style={{ width: `${pedido.progreso}%` }} />
              </div>
              <small className="order-note">
                {pedido.progreso >= 60
                  ? "Tu paquete esta en camino"
                  : "Pedido recibido y en preparacion"}
              </small>
            </div>
            <div className="order-total">
              <small>Total</small>
              <b>${Number(pedido.total).toFixed(2)}</b>
              <span>{pedido.progreso}% recorrido</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function Seguimiento({ pedidos }) {
  const activos = pedidos.filter((item) =>
    ["pendiente", "confirmado", "en_transito"].includes(item.estado),
  );
  const pedido =
    activos.find((item) => item.estado === "en_transito") || activos[0];
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SEGUIMIENTO EN TIEMPO REAL</p>
          <h1>Ubicacion del paquete</h1>
          <p className="muted">
            Ruta estimada desde Estados Unidos hasta tu destino.
          </p>
        </div>
        <span className="date-chip">
          <i className="live-dot" /> POSICION ACTUALIZADA
        </span>
      </div>
      {pedido ? (
        <div className="tracking-layout">
          <div className="panel map-panel">
            <div className="map-grid">
              <span className="map-road road-one" />
              <span className="map-road road-two" />
              <span className="map-road road-three" />
              <span className="map-origin">ESTADOS UNIDOS</span>
              <span className="map-destination">
                {pedido.destino.toUpperCase()}
              </span>
              <span
                className="map-route"
                style={{ width: `${Math.max(12, pedido.progreso)}%` }}
              />
              <span
                className="map-marker"
                style={{ left: `${Math.max(9, pedido.progreso)}%` }}
              >
                PK
              </span>
            </div>
            <div className="map-legend">
              <span>
                <i className="legend-cyan" />
                Ruta estimada
              </span>
              <span>
                <i className="legend-green" />
                Destino
              </span>
              <span>
                <i className="legend-orange" />
                Paquete en movimiento
              </span>
            </div>
          </div>
          <aside className="panel tracking-summary">
            <p className="eyebrow">PEDIDO SELECCIONADO</p>
            <h2>{pedido.id}</h2>
            <span className={`status ${pedido.estado}`}>
              {pedido.estado.replace("_", " ")}
            </span>
            <div className="big-progress">{pedido.progreso}%</div>
            <p className="muted">Origen: Estados Unidos</p>
            <p className="muted">Destino: {pedido.destino}</p>
            <div className="timeline">
              <span className="done">Pedido creado</span>
              <span className={pedido.progreso > 25 ? "done" : ""}>
                Salida de Estados Unidos
              </span>
              <span className={pedido.progreso > 60 ? "done" : ""}>
                En transito
              </span>
              <span className={pedido.progreso >= 100 ? "done" : ""}>
                Entregado
              </span>
            </div>
          </aside>
        </div>
      ) : (
        <div className="empty panel">
          <span>PK</span>
          <h2>No hay paquetes para rastrear</h2>
          <p className="muted">Los pedidos apareceran aqui al confirmarse.</p>
        </div>
      )}
    </>
  );
}

function Perfil({ usuario, tema, cambiarTema, idioma, cambiarIdioma, salir }) {
  const [foto, setFoto] = useState(localStorage.getItem("ie_foto") || "");
  function fnFoto(event) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      setFoto(lector.result);
      localStorage.setItem("ie_foto", lector.result);
    };
    lector.readAsDataURL(archivo);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CUENTA Y PREFERENCIAS</p>
          <h1>Mi perfil</h1>
          <p className="muted">Administra tus datos, idioma y apariencia.</p>
        </div>
      </div>
      <div className="profile-layout">
        <section className="panel profile-card">
          <div className="profile-avatar-wrap">
            {foto ? (
              <img
                className="profile-avatar profile-photo"
                src={foto}
                alt="Foto de perfil"
              />
            ) : (
              <div className="profile-avatar">{usuario.nombre[0]}</div>
            )}
            <label className="photo-button" title="Cambiar foto">
              <Camera size={15} />
              <input type="file" accept="image/*" onChange={fnFoto} />
            </label>
          </div>
          <h2>
            {usuario.nombre} {usuario.apellidos || ""}
          </h2>
          <p className="muted">{usuario.correo}</p>
          <span className="status confirmado">{usuario.rol}</span>
          <div className="profile-fields">
            <label>
              Nombre
              <input value={usuario.nombre} readOnly />
            </label>
            <label>
              Correo
              <input value={usuario.correo} readOnly />
            </label>
            <label>
              Cuenta
              <input value="Cliente mayorista" readOnly />
            </label>
          </div>
        </section>
        <section className="panel settings-card">
          <p className="eyebrow">APARIENCIA</p>
          <h2>Modo de visualizacion</h2>
          <div className="theme-options">
            <button
              className={tema === "oscuro" ? "theme-selected" : ""}
              onClick={() => cambiarTema("oscuro")}
            >
              <span className="theme-preview dark-preview" />
              Oscuro
            </button>
            <button
              className={tema === "claro" ? "theme-selected" : ""}
              onClick={() => cambiarTema("claro")}
            >
              <span className="theme-preview light-preview" />
              Claro
            </button>
          </div>
          <p className="eyebrow">IDIOMA</p>
          <div className="language-select">
            <Globe2 size={16} />
            <select
              value={idioma}
              onChange={(event) => cambiarIdioma(event.target.value)}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <hr />
          <p className="eyebrow">SESION</p>
          <button className="secondary-action" onClick={salir}>
            <LogOut size={15} /> Cerrar sesion
          </button>
        </section>
      </div>
    </>
  );
}

function SeguimientoInteractivo({ pedidos }) {
  const activos = pedidos.filter((item) =>
    ["pendiente", "confirmado", "en_transito"].includes(item.estado),
  );
  const pedidoReal =
    activos.find((item) => item.estado === "en_transito") || activos[0];
  const pedido = pedidoReal || {
    id: "PREVISUALIZACION",
    estado: "en_transito",
    progreso: 42,
    destino: "San Salvador",
    envio: "Express",
  };
  const [zoom, setZoom] = useState(5);
  const [recargar, setRecargar] = useState(0);
  const mapa =
    "https://www.openstreetmap.org/export/embed.html?bbox=-120%2C10%2C-65%2C45&layer=mapnik";
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SEGUIMIENTO EN TIEMPO REAL</p>
          <h1>Ubicacion del paquete</h1>
          <p className="muted">
            Mapa interactivo de la ruta estimada desde Estados Unidos.
          </p>
        </div>
        <span className="date-chip">
          <i className="live-dot" /> POSICION ACTUALIZADA
        </span>
      </div>
      <div className="tracking-layout">
        <div className="panel map-panel map-interactive">
          <div className="map-toolbar">
            <button
              onClick={() => setZoom((actual) => Math.min(18, actual + 1))}
            >
              +
            </button>
            <button
              onClick={() => setZoom((actual) => Math.max(2, actual - 1))}
            >
              -
            </button>
            <button onClick={() => setRecargar((actual) => actual + 1)}>
              Actualizar
            </button>
            <span>Nivel {zoom}</span>
          </div>
          <iframe
            key={recargar}
            title="Mapa interactivo de seguimiento"
            src={mapa}
            className="real-map"
          />
          <div className="map-status">
            <Package size={15} />{" "}
            {pedidoReal
              ? `Paquete ${pedido.progreso}% en ruta`
              : "Vista de previsualizacion"}{" "}
            · Origen: Estados Unidos · Destino: {pedido.destino}
          </div>
        </div>
        <aside className="panel tracking-summary">
          <p className="eyebrow">
            {pedidoReal ? "PEDIDO SELECCIONADO" : "VISTA DE PREVISUALIZACION"}
          </p>
          <h2>{pedido.id}</h2>
          <span className={`status ${pedido.estado}`}>
            {pedido.estado.replace("_", " ")}
          </span>
          <div className="big-progress">{pedido.progreso}%</div>
          <p className="muted">Actualizacion por WebSocket activa</p>
          <div className="timeline">
            <span className="done">Pedido creado</span>
            <span className={pedido.progreso > 25 ? "done" : ""}>
              Salida de Estados Unidos
            </span>
            <span className={pedido.progreso > 60 ? "done" : ""}>
              En transito
            </span>
            <span className={pedido.progreso >= 100 ? "done" : ""}>
              Entregado
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
