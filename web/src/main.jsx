import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import "./styles.css";

const API = (
  import.meta.env.VITE_API_URL ||
  "https://instantly-express-production.up.railway.app/api"
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
const FOTOS_CATALOGO = {
  streaming: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=60",
  ],
  electronica: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1526738549149-8e07ca6c147f?auto=format&fit=crop&w=800&q=60",
  ],
  hogar: [
    "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=60",
  ],
  ropa: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=60",
  ],
  belleza: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=60",
  ],
  deportes: [
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=60",
  ],
  oficina: [
    "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
  ],
  servicios: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=60",
  ],
};
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const MAP_ID_DEMO = "DEMO_MAP_ID";
// Origen: Miami USA. Destino varia por pedido (San Salvador por defecto).
const ORIGEN_RUTA = { lat: 25.7617, lng: -80.1918, nombre: "Miami, USA" };
function fnDestinoPedido(destino) {
  const d = String(destino || "San Salvador").toLowerCase();
  if (d.includes("mexico") || d.includes("cdmx")) return { lat: 19.4326, lng: -99.1332, nombre: "Ciudad de Mexico" };
  if (d.includes("guatemala")) return { lat: 14.6349, lng: -90.5069, nombre: "Guatemala" };
  if (d.includes("honduras") || d.includes("tegucigalpa")) return { lat: 14.0723, lng: -87.1921, nombre: "Tegucigalpa" };
  if (d.includes("nicaragua") || d.includes("managua")) return { lat: 12.1364, lng: -86.2514, nombre: "Managua" };
  if (d.includes("costa rica") || d.includes("san jose")) return { lat: 9.9281, lng: -84.0907, nombre: "San Jose" };
  if (d.includes("panama")) return { lat: 8.9824, lng: -79.5199, nombre: "Panama" };
  return { lat: 13.6929, lng: -89.2182, nombre: "San Salvador" };
}
// Punto sobre la ruta ortodromica (gran circulo) entre A y B; avance de 0 a 1.
function fnPuntoGeodesico(a, b, avance) {
  const f = Math.min(1, Math.max(0, Number(avance) || 0));
  const rad = Math.PI / 180;
  const lat1 = a.lat * rad;
  const lng1 = a.lng * rad;
  const lat2 = b.lat * rad;
  const lng2 = b.lng * rad;
  const d = 2 * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng2 - lng1) / 2), 2),
    ),
  );
  if (!d) return { lat: a.lat, lng: a.lng };
  const pa = Math.sin((1 - f) * d) / Math.sin(d);
  const pb = Math.sin(f * d) / Math.sin(d);
  const x = pa * Math.cos(lat1) * Math.cos(lng1) + pb * Math.cos(lat2) * Math.cos(lng2);
  const y = pa * Math.cos(lat1) * Math.sin(lng1) + pb * Math.cos(lat2) * Math.sin(lng2);
  const z = pa * Math.sin(lat1) + pb * Math.sin(lat2);
  return {
    lat: (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI,
    lng: (Math.atan2(y, x) * 180) / Math.PI,
  };
}
// Recorrido A -> B densificado sobre el gran circulo, listo para trazarse.
function fnPuntosRuta(origen, destino, tramos) {
  const total = Math.max(2, Math.floor(tramos || 160));
  const puntos = [];
  for (let i = 0; i <= total; i += 1) {
    puntos.push(fnPuntoGeodesico(origen, destino, i / total));
  }
  return puntos;
}
// Avance 0..1 que traza el recorrido completo; se reinicia cuando cambia la llave.
function useTrazoRecorrido(llave, duracion) {
  const [avance, setAvance] = useState(0);
  useEffect(() => {
    setAvance(0);
    const tiempo = Math.max(400, duracion || 5200);
    const inicio = performance.now();
    let cuadro = 0;
    let ultimo = 0;
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / tiempo);
      const valor = Math.round(t * 100) / 100;
      if (valor !== ultimo) {
        ultimo = valor;
        setAvance(valor);
      }
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [llave, duracion]);
  return avance;
}
// Traza la ruta A -> B mientras el camion avanza; la camara acompana el recorrido.
function RutaAnimada({ origen, destino, avance, modo, relieve3d }) {
  const mapa = useMap();
  const puntos = React.useMemo(
    () => fnPuntosRuta(origen, destino, 160),
    [origen.lat, origen.lng, destino.lat, destino.lng],
  );
  const planRef = React.useRef(null);
  const trazoRef = React.useRef(null);
  const avanceRef = React.useRef(0);
  avanceRef.current = avance;
  const llave = pedidoKey(origen, destino);
  // 1) Ruta completa (cian = ruta planificada) + recorrido trazado (verde).
  React.useEffect(() => {
    if (!mapa || !window.google || puntos.length < 2) return;
    const extremos = [puntos[0], puntos[puntos.length - 1]];
    if (!planRef.current) {
      planRef.current = new window.google.maps.Polyline({
        path: extremos,
        geodesic: true,
        strokeColor: "#00E5FF",
        strokeOpacity: 0.45,
        strokeWeight: 3,
      });
      planRef.current.setMap(mapa);
    } else {
      planRef.current.setPath(extremos);
    }
    if (!trazoRef.current) {
      trazoRef.current = new window.google.maps.Polyline({
        path: [puntos[0], puntos[1]],
        geodesic: true,
        strokeColor: "#39FF6A",
        strokeOpacity: 1,
        strokeWeight: 5,
      });
      trazoRef.current.setMap(mapa);
    }
    return () => {
      if (planRef.current) planRef.current.setMap(null);
      if (trazoRef.current) trazoRef.current.setMap(null);
      planRef.current = null;
      trazoRef.current = null;
    };
  }, [mapa, llave, puntos]);
  // 2) La linea verde se dibuja de A hacia B: su punta es la posicion del camion.
  React.useEffect(() => {
    if (!trazoRef.current || puntos.length < 2) return;
    const total = puntos.length - 1;
    const corte = Math.floor(Math.min(1, Math.max(0, avance)) * total);
    const tramo = puntos.slice(0, Math.max(1, corte + 1));
    if (corte < total) tramo.push(fnPuntoGeodesico(origen, destino, avance));
    trazoRef.current.setPath(tramo);
  }, [avance, puntos, origen.lat, origen.lng, destino.lat, destino.lng]);
  // Secuencia cine: zoom rapido al origen -> panea al camion -> zoom-out para ver ruta completa.
  React.useEffect(() => {
    if (!mapa) return;
    const inclinar3d = relieve3d !== false && modo === "satellite";
    try {
      mapa.setTilt(inclinar3d ? 45 : 0);
    } catch {}
    try {
      mapa.setHeading(inclinar3d ? 25 : 0);
    } catch {}
    const timers = [];
    // 1) Zoom rapido al origen
    try { mapa.setZoom(11); mapa.panTo(origen); } catch {}
    // 2) Seguir al camion (punta del trazo, en movimiento)
    timers.push(setTimeout(() => {
      try {
        mapa.panTo(fnPuntoGeodesico(origen, destino, avanceRef.current));
        mapa.setZoom(7);
      } catch {}
    }, 900));
    // 3) Alejarse para ver origen + destino juntos
    timers.push(setTimeout(() => {
      try {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(origen);
        bounds.extend(destino);
        mapa.fitBounds(bounds, 60);
      } catch {}
    }, 2200));
    return () => timers.forEach(clearTimeout);
  }, [mapa, modo, relieve3d, llave, origen.lat, origen.lng, destino.lat, destino.lng]);
  return null;
}
function pedidoKey(origen, destino) {
  return `${origen.lat},${origen.lng}-${destino.lat},${destino.lng}`;
}
// Barra del recorrido: muestra el trazo de A a B y su porcentaje.
function TrazoRecorrido({ origen, destino, avance, completa }) {
  const trazado = Math.round(Math.min(1, Math.max(0, avance)) * 100);
  const completo = avance >= 1;
  return (
    <div className="mapa-trazo">
      <div className="mapa-trazo-cabecera">
        <span>{completo ? "Recorrido completo" : "Trazando ruta A -> B"}</span>
        <strong>{trazado}%</strong>
      </div>
      <div className="mapa-trazo-track">
        <i style={{ width: `${trazado}%` }} />
      </div>
      <p className="mapa-trazo-pie">
        {origen.nombre} → {destino.nombre}
        {completo && completa ? " · llegada confirmada" : ""}
      </p>
    </div>
  );
}
function fnFotoVariada(grupo, id) {
  const lista = FOTOS_CATALOGO[grupo] || [IMAGEN_POR_DEFECTO];
  return lista[Number(id || 0) % lista.length];
}
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
    imagen: fnFotoVariada("electronica", 3),
    descripcion: "Audio cerrado para streaming, edición y monitoreo.",
  },
  {
    id: 7,
    nombre: "Smart TV 55 pulgadas 4K",
    proveedor: "Volt Supply",
    categoria: "Electrónica",
    precio: 389.9,
    minimo: 2,
    stock: 14,
    color: "#00E5FF",
    imagen: fnFotoVariada("streaming", 1),
    descripcion: "Pantalla 4K para salas de venta y exhibición.",
  },
  {
    id: 8,
    nombre: "Laptop ultradelgada 14",
    proveedor: "Tecno Mayorista",
    categoria: "Electrónica",
    precio: 649.0,
    minimo: 2,
    stock: 22,
    color: "#7AA2FF",
    imagen: fnFotoVariada("electronica", 2),
    descripcion: "Equipo liviano para operación comercial y oficina.",
  },
  {
    id: 9,
    nombre: "Set de maquillaje profesional",
    proveedor: "Belleza Total",
    categoria: "Belleza",
    precio: 24.5,
    minimo: 6,
    stock: 68,
    color: "#FF7AC0",
    imagen: fnFotoVariada("belleza", 0),
    descripcion: "Paletas y brochas de alta rotación para tiendas.",
  },
  {
    id: 10,
    nombre: "Kit skincare facial",
    proveedor: "Belleza Total",
    categoria: "Belleza",
    precio: 32.9,
    minimo: 4,
    stock: 52,
    color: "#FFB3D9",
    imagen: fnFotoVariada("belleza", 1),
    descripcion: "Rutina completa para reventa en farmacias y tiendas.",
  },
  {
    id: 11,
    nombre: "Camiseta básica pack x3",
    proveedor: "Distrito 9",
    categoria: "Ropa y accesorios",
    precio: 19.9,
    minimo: 8,
    stock: 140,
    color: "#FFC93C",
    imagen: fnFotoVariada("ropa", 2),
    descripcion: "Pack de camisetas de algodón en tallas surtidas.",
  },
  {
    id: 12,
    nombre: "Zapatillas running",
    proveedor: "Zona Deportiva",
    categoria: "Deportes",
    precio: 54.9,
    minimo: 4,
    stock: 37,
    color: "#39FF6A",
    imagen: fnFotoVariada("deportes", 0),
    descripcion: "Calzado ligero para entrenamiento diario.",
  },
  {
    id: 13,
    nombre: "Bicicleta urbana aro 29",
    proveedor: "Zona Deportiva",
    categoria: "Deportes",
    precio: 219.0,
    minimo: 1,
    stock: 9,
    color: "#00E5FF",
    imagen: fnFotoVariada("deportes", 1),
    descripcion: "Bicicleta resistente para reparto y ciudad.",
  },
  {
    id: 14,
    nombre: "Set mancuernas 20kg",
    proveedor: "Zona Deportiva",
    categoria: "Deportes",
    precio: 89.9,
    minimo: 2,
    stock: 26,
    color: "#FF7A1A",
    imagen: fnFotoVariada("deportes", 2),
    descripcion: "Par de mancuernas ajustables para gimnasio.",
  },
  {
    id: 15,
    nombre: "Escritorio ejecutivo",
    proveedor: "Ofi Hogar",
    categoria: "Oficina",
    precio: 149.0,
    minimo: 2,
    stock: 17,
    color: "#B991FF",
    imagen: fnFotoVariada("oficina", 0),
    descripcion: "Escritorio amplio con acabado premium.",
  },
  {
    id: 16,
    nombre: "Silla ergonomica",
    proveedor: "Ofi Hogar",
    categoria: "Oficina",
    precio: 129.9,
    minimo: 2,
    stock: 29,
    color: "#7AA2FF",
    imagen: fnFotoVariada("oficina", 1),
    descripcion: "Silla con soporte lumbar para jornadas largas.",
  },
  {
    id: 17,
    nombre: "Camara web Full HD",
    proveedor: "Tecno Mayorista",
    categoria: "Electrónica",
    precio: 26.4,
    minimo: 5,
    stock: 61,
    color: "#00E5FF",
    imagen: fnFotoVariada("streaming", 3),
    descripcion: "Video nitido para streaming y videollamadas.",
  },
  {
    id: 18,
    nombre: "Maceta decorativa + planta",
    proveedor: "Flora Norte",
    categoria: "Producto físico",
    precio: 14.9,
    minimo: 6,
    stock: 74,
    color: "#39FF6A",
    imagen: fnFotoVariada("hogar", 2),
    descripcion: "Decoracion natural para hogar y oficina.",
  },
  {
    id: 19,
    nombre: "Lampara de escritorio LED",
    proveedor: "Volt Supply",
    categoria: "Electrónica",
    precio: 22.5,
    minimo: 4,
    stock: 48,
    color: "#FFC93C",
    imagen: fnFotoVariada("electronica", 4),
    descripcion: "Luz regulable para estudio y oficina.",
  },
  {
    id: 20,
    nombre: "Suscripcion catalogo familiar",
    proveedor: "Nube Media",
    categoria: "Servicios",
    precio: 12.9,
    minimo: 3,
    stock: 300,
    color: "#B991FF",
    imagen: fnFotoVariada("servicios", 2),
    descripcion: "Acceso familiar para contenido digital.",
  },
];

function fnFechaFactura(valor) {
  try {
    const fecha = valor ? new Date(valor) : new Date();
    const f = Number.isNaN(fecha.getTime()) ? new Date() : fecha;
    return {
      fecha: f.toLocaleDateString("es-SV", { day: "2-digit", month: "2-digit", year: "numeric" }),
      hora: f.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" }),
    };
  } catch {
    return { fecha: "22/09/2026", hora: "12:00 AM" };
  }
}
function fnEscaparPdf(texto) {
  return String(texto)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}
function fnDescargarFactura(pedido, opciones = {}, usuarioFactura = null) {
  const lineas = Array.isArray(opciones.lineas)
    ? opciones.lineas : Array.isArray(pedido.lineas) ? pedido.lineas : [];
  const cliente = opciones.cliente || pedido.cliente || usuarioFactura || {};
  const nombreBase = [cliente.nombre, cliente.apellidos].filter(Boolean).join(" ").trim();
  const nombreCliente = nombreBase || pedido.clienteNombre || "Cliente";
  const telefonoCliente = cliente.telefono || pedido.telefono || "+503 0000-0000";
  const correoCliente = cliente.correo || pedido.correo || "cliente@demo.com";
  const metodo = String(pedido.metodoPago || opciones.metodoPago || "Transferencia bancaria").toLowerCase();
  const esEfectivo = metodo.includes("efectivo") || metodo.includes("cash");
  const esTarjeta = metodo.includes("tarjeta") || metodo.includes("card");
  const subtotal = Number(pedido.total || opciones.total || 74.8);
  const descuento = Number(pedido.descuento ?? opciones.descuento ?? 0) || 0;
  const impuestos = Number(pedido.impuestos ?? opciones.impuestos ?? 0) || 0;
  const totalPagar = Number(pedido.totalPagar ?? subtotal - descuento + impuestos) || subtotal;
  const fh = fnFechaFactura(pedido.fecha || pedido.creado);
  const numero = pedido.numeroFactura || "050-000800";
  const filas = lineas.length ? lineas.map((l) => {
    const nombre = l.producto?.nombre || l.nombre || "Producto/servicio";
    const cant = Number(l.cantidad ?? 1);
    const precio = Number(l.producto?.precio ?? l.precio ?? 0);
    return [String(cant), nombre, `$${precio.toFixed(2)}`, `$${(cant * precio).toFixed(2)}`];
  }) : [
    ["1", "Catalogo Stream Premium", "$18.50", "$18.50"],
    ["1", "Audifonos de estudio", "$29.90", "$29.90"],
    ["1", "Camara web Full HD", "$26.40", "$26.40"],
  ];
  try {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const azul = [122, 184, 221];
    const azulOscuro = [27, 58, 95];
    const borde = [35, 35, 35];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...azulOscuro);
    doc.text("INSTANTLY", 52, 58);
    doc.text("EXPRESS", 52, 78);
    doc.setFontSize(19);
    doc.setTextColor(20, 20, 20);
    doc.text("FACTURA", 430, 58);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`N. de factura:      ${numero}`, 330, 78);
    doc.text(`Fecha:                  ${fh.fecha}`, 330, 90);
    doc.text(`Hora:                   ${fh.hora}`, 330, 102);
    doc.text("Tel: +503 1234-5678", 52, 102);
    doc.setTextColor(20, 120, 160);
    doc.text("instantly@gmail.com", 52, 114);
    doc.setFillColor(...azul);
    doc.rect(52, 132, 508, 16, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("DATOS DEL CLIENTE", 58, 144);
    autoTable(doc, {
      startY: 148,
      margin: { left: 52, right: 52 },
      theme: "grid",
      styles: { fontSize: 8.5, cellPadding: 4, lineColor: borde },
      columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 398 } },
      body: [["Nombre:", nombreCliente], ["Telefono:", telefonoCliente], ["Correo:", correoCliente]],
    });
    const finCliente = doc.lastAutoTable.finalY;
    autoTable(doc, {
      startY: finCliente + 12,
      margin: { left: 52, right: 52 },
      theme: "grid",
      headStyles: { fillColor: azul, textColor: [20, 20, 20], fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 5, lineColor: borde },
      columnStyles: {
        0: { cellWidth: 90, halign: "center" },
        1: { cellWidth: 238 },
        2: { cellWidth: 90, halign: "right" },
        3: { cellWidth: 90, halign: "right" },
      },
      head: [["Cantidad", "Producto/servicio", "Precio", "Total"]],
      body: filas,
    });
    const finTabla = doc.lastAutoTable.finalY;
    const pagoY = finTabla + 12;
    doc.setDrawColor(...borde);
    doc.rect(52, pagoY, 508, 112);
    doc.line(288, pagoY, 288, pagoY + 112);
    doc.setFillColor(...azul);
    doc.rect(60, pagoY + 8, 140, 15, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text("FORMA DE PAGO", 66, pagoY + 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(`${esEfectivo ? "[x]" : "[ ]"}   Efectivo`, 66, pagoY + 48);
    doc.text(`${esTarjeta ? "[x]" : "[ ]"}   Tarjeta`, 66, pagoY + 68);
    doc.text(`${!esEfectivo && !esTarjeta ? "[x]" : "[ ]"}   Transferencia`, 66, pagoY + 88);
    autoTable(doc, {
      startY: pagoY + 8,
      margin: { left: 296, right: 52 },
      theme: "grid",
      styles: { fontSize: 8.5, cellPadding: 5, lineColor: borde },
      columnStyles: { 0: { cellWidth: 132 }, 1: { cellWidth: 132, halign: "right" } },
      body: [
        ["Subtotal", `$${subtotal.toFixed(2)}`],
        ["Descuento (0%)", `$${descuento.toFixed(2)}`],
        ["Impuestos (0%)", `$${impuestos.toFixed(2)}`],
      ],
    });
    const finTotales = doc.lastAutoTable.finalY;
    doc.setFillColor(...azul);
    doc.rect(296, finTotales, 264, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("Total a pagar", 302, finTotales + 14);
    doc.text(`$${totalPagar.toFixed(2)}`, 548, finTotales + 14, { align: "right" });
    doc.setDrawColor(...borde);
    doc.rect(52, pagoY + 124, 508, 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("-------   GRACIAS POR SU COMPRA   -------", 306, pagoY + 139, { align: "center" });
    doc.save(`factura-${pedido.id || numero}.pdf`);
    return;
  } catch {
    // Respaldo simple si jsPDF falla.
  }
  const lineasTexto = [
    `INSTANTLY EXPRESS`,
    `FACTURA ${numero}`,
    `Pedido: ${pedido.id}`,
    `Fecha: ${fh.fecha} ${fh.hora}`,
    `Cliente: ${nombreCliente}`,
    `Metodo de pago: ${pedido.metodoPago || "Transferencia bancaria"}`,
    `Total: $${totalPagar.toFixed(2)}`,
  ];
  let contenido = "BT\n/F1 16 Tf\n50 780 Td\n";
  lineasTexto.forEach((linea, indice) => {
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

function PantallaCarga({ visible }) {
  if (!visible) return null;
  return (
    <div className="splash" aria-hidden="true">
      <div className="splash-veil" />
      <img src={logo} alt="Instantly Express" className="splash-logo" />
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("ie_usuario") || "null") || {
      id: 1,
      nombre: "María",
      apellidos: "Comercio",
      correo: "cliente@demo.com",
      rol: "cliente",
    }
  );
  const [token, setToken] = useState(
    localStorage.getItem("ie_token") || ""
  );
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
  const [cargandoSesion, setCargandoSesion] = useState(false);

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
        } else {
          setAviso("");
        }
      })
      .catch(() => {
        setAviso("");
      });
  }, [token]);
  useEffect(() => {
    if (!token || token === "libre") return undefined;
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
        `Existencias actualizadas: ${evento.stockDisponible} disponibles`
      )
    );
    socket.on("pedido:actualizado", (pedido) =>
      setPedidos((actuales) => [
        pedido,
        ...actuales.filter((item) => item.id !== pedido.id),
      ])
    );
    return () => socket.disconnect();
  }, [token]);

  function fnSesion(datos) {
    setCargandoSesion(true);
    setToken(datos.token);
    setUsuario(datos.usuario);
    localStorage.setItem("ie_token", datos.token);
    localStorage.setItem("ie_usuario", JSON.stringify(datos.usuario));
    setVista("inicio");
    setTimeout(() => setCargandoSesion(false), 2400);
  }
  function fnSesionLibre(correoLibre = "") {
    const correoFinal = String(correoLibre || "").trim() || "cliente@demo.com";
    const nombreFinal = correoFinal.includes("@") ? correoFinal.split("@")[0] : "Invitado";
    const datos = {
      token: "libre",
      usuario: {
        id: 1,
        nombre: nombreFinal || "Invitado",
        apellidos: "Comercio",
        correo: correoFinal,
        rol: "cliente",
      },
    };
    setToken("libre");
    setUsuario(datos.usuario);
    localStorage.setItem("ie_token", "libre");
    localStorage.setItem("ie_usuario", JSON.stringify(datos.usuario));
    setCargandoSesion(true);
    setVista("inicio");
    setTimeout(() => setCargandoSesion(false), 2400);
  }
  async function fnAgregar(producto) {
    if (!token || token === "libre") {
      setCarrito((actual) => {
        const linea = actual.find((item) => item.idProducto === producto.id);
        if (linea)
          return actual.map((item) =>
            item.idProducto === producto.id
              ? { ...item, cantidad: item.cantidad + producto.minimo }
              : item
          );
        return [
          ...actual,
          {
            idDetalle: `libre-${producto.id}-${Date.now()}`,
            idProducto: producto.id,
            cantidad: producto.minimo,
            producto,
          },
        ];
      });
      setAviso(`${producto.nombre} agregado al carrito`);
      return;
    }
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
    if (!token || token === "libre") {
      if (carrito.length === 0) {
        setAviso("El carrito está vacío");
        return;
      }
      const total = carrito.reduce(
        (suma, linea) => suma + linea.producto.precio * linea.cantidad,
        0
      );
      const pedido = {
        id: `IE-${Date.now().toString().slice(-6)}`,
        fecha: new Date().toISOString().slice(0, 10),
        estado: "pendiente",
        progreso: 10,
        total,
        destino: "San Salvador",
        envio: "Express",
        metodoPago:
          [
            "Tarjeta",
            "Transferencia bancaria",
            "Pago contra entrega",
          ].includes(metodoPago) || typeof metodoPago === "string"
            ? metodoPago
            : "Transferencia bancaria",
      };
      setPedidos((actuales) => [pedido, ...actuales]);
      setCarrito([]);
      fnDescargarFactura(pedido, {
        lineas: carrito,
        cliente: usuarioActivo,
        metodoPago,
      }, usuarioActivo);
      setVista("pedidos");
      setAviso("Pedido creado en modo libre. La factura PDF se descargó.");
      return;
    }
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
      fnDescargarFactura(pedido, {
        cliente: usuarioActivo,
        metodoPago: elegido,
      }, usuarioActivo);
      setVista("pedidos");
      setAviso("Pedido creado. La factura PDF se descargó.");
    } catch (error) {
      setAviso(error.message);
    }
  }
  function fnSalir() {
    localStorage.clear();
    setToken("");
    setUsuario({
      id: 1,
      nombre: "María",
      apellidos: "Comercio",
      correo: "cliente@demo.com",
      rol: "cliente",
    });
    setVista("inicio");
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
  const usuarioActivo = usuario || {
    id: 1,
    nombre: "María",
    apellidos: "Comercio",
    correo: "cliente@demo.com",
    rol: "cliente",
  };
  const filtrados = productos.filter((item) =>
    `${item.nombre} ${item.proveedor} ${item.categoria}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );
  const idiomaActual = traducciones[idioma] || traducciones.es;
  const sesionIniciada = Boolean(token);
  if (!sesionIniciada) {
    return (
      <>
        <PantallaCarga visible={cargandoSesion} />
        <Acceso onLogin={fnSesion} onLibre={fnSesionLibre} />
      </>
    );
  }
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
    <>
      <PantallaCarga visible={cargandoSesion} />
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
            <span className="avatar">{usuarioActivo.nombre[0]}</span>
            <div>
              <strong>{usuarioActivo.nombre}</strong>
              <small>{usuarioActivo.rol} · libre</small>
            </div>
            <button className="logout" onClick={fnSalir} title="Restablecer demo">
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
            <Inicio usuario={usuarioActivo} pedidos={pedidos} ir={setVista} />
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
          {vista === "seguimiento" && <SeguimientoInteractivo pedidos={pedidos} />}
          {vista === "perfil" && (
            <Perfil
              usuario={usuarioActivo}
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
    </>
  );
}

function Acceso({ onLogin, onLibre }) {
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  return (
    <div>
      <Login
        onLogin={onLogin}
        onLibre={onLibre}
        alRecuperar={() => setMostrarRecuperacion(true)}
        alRegistrar={() => setMostrarRegistro(true)}
      />
      {mostrarRegistro && (
        <Registro onLogin={onLogin} cerrar={() => setMostrarRegistro(false)} />
      )}
      {mostrarRecuperacion && (
        <Recuperar cerrar={() => setMostrarRecuperacion(false)} />
      )}
    </div>
  );
}
function Login({ onLogin, onLibre, alRecuperar, alRegistrar }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  async function fnEntrar(event) {
    event.preventDefault();
    setError("");
    if (!String(contrasena || "").trim()) {
      onLibre(correo);
      return;
    }
    try {
      const datos = await fnPedir("/auth/login", "", {
        method: "POST",
        body: JSON.stringify({ correo, contrasena }),
      });
      onLogin(datos);
    } catch (e) {
      const mensaje = String(e.message || "");
      if (mensaje.includes("Failed to fetch"))
        setError(
          `No se pudo conectar a ${API}/auth/login. Revisa que VITE_API_URL sea https://instantly-express-production.up.railway.app/api y haz Redeploy de la web.`
        );
      else setError(mensaje || "No se pudo iniciar sesión");
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
            Contraseña (opcional: vacio entra libre)
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Dejala vacia para entrar libre"
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="primary full">Iniciar sesion</button>
          <button
            type="button"
            className="ghost full"
            style={{ marginTop: 8 }}
            onClick={() => onLibre(correo)}
          >
            Entrar libre sin contraseña
          </button>
          <div className="login-links">
            <button type="button" className="forgot-link" onClick={alRecuperar}>
              ¿Olvidaste tu contraseña?
            </button>
            <span className="login-links-sep" aria-hidden="true" />
            <button type="button" className="access-switch" onClick={alRegistrar}>
              Crear una cuenta
            </button>
          </div>
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
                <option>Efectivo</option>
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
const filtrosPedidos = [
  { id: "todos", texto: "Todos", estados: null },
  {
    id: "proceso",
    texto: "En proceso",
    estados: ["pendiente", "confirmado", "en_transito"],
  },
  { id: "entregados", texto: "Entregados", estados: ["entregado"] },
];
function fnFiltrarPedidos(pedidos, filtro) {
  const opcion = filtrosPedidos.find((item) => item.id === filtro);
  if (!opcion || !opcion.estados) return pedidos;
  return pedidos.filter((pedido) => opcion.estados.includes(pedido.estado));
}
function Pedidos({ pedidos, ir }) {
  const [filtro, setFiltro] = useState("todos");
  const visibles = fnFiltrarPedidos(pedidos, filtro);
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
      <div className="history-tabs" role="tablist" aria-label="Filtrar pedidos">
        {filtrosPedidos.map((opcion) => {
          const activo = filtro === opcion.id;
          return (
            <button
              type="button"
              role="tab"
              key={opcion.id}
              aria-selected={activo}
              className={activo ? "filter-active" : ""}
              onClick={() => setFiltro(opcion.id)}
            >
              {opcion.texto}
              <span className="history-tab-count">
                {fnFiltrarPedidos(pedidos, opcion.id).length}
              </span>
            </button>
          );
        })}
      </div>
      {!visibles.length ? (
        <div className="empty panel orders-empty">
          <span>+</span>
          <h2>Sin pedidos en este filtro</h2>
          <p className="muted">
            Cambia de filtro o agrega referencias desde el catalogo.
          </p>
          <button className="primary" onClick={() => ir("catalogo")}>
            Ir al catalogo
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {visibles.map((pedido) => (
          <article className="panel order-card" key={pedido.id}>
            <div className="order-icon">IE</div>
            <div className="order-main">
              <div>
                <strong>{pedido.id}</strong>
                <span className={`status ${pedido.estado}`}>
                  {pedido.estado.replace(/_/g, " ")}
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
      )}
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
  return <MapaGoogle pedido={pedido} pedidoReal={pedidoReal} />;
}

// Elige el mapa real de Google o el respaldo con teselas cuando falta la clave.
function MapaGoogle({ pedido, pedidoReal }) {
  if (!GOOGLE_MAPS_API_KEY) {
    return <MapaRespaldo pedido={pedido} pedidoReal={pedidoReal} />;
  }
  return <MapaConGoogle pedido={pedido} pedidoReal={pedidoReal} />;
}

function MapaConGoogle({ pedido, pedidoReal }) {
  const origen = ORIGEN_RUTA;
  const destino = fnDestinoPedido(pedido.destino);
  const [modo, setModo] = useState("roadmap");
  const [trafico, setTrafico] = useState(true);
  const [relieve3d, setRelieve3d] = useState(true);
  const [replay, setReplay] = useState(0);
  // El recorrido se traza solo de A a B cada vez que cambia el pedido o se repite.
  const avance = useTrazoRecorrido(
    `${pedido.id}-${replay}-${pedidoKey(origen, destino)}`,
    5600,
  );
  const camion = fnPuntoGeodesico(origen, destino, avance);
  const trazado = Math.round(avance * 100);
  const centroMedio = {
    lat: (origen.lat + destino.lat) / 2,
    lng: (origen.lng + destino.lng) / 2,
  };
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">SEGUIMIENTO EN TIEMPO REAL</p>
            <h1>Ubicacion del paquete</h1>
            <p className="muted">
              Google Maps: zoom rapido al origen, sigue al camion y traza la
              linea completa hasta el destino.
            </p>
          </div>
          <span className="date-chip">
            <i className="live-dot" /> POSICION ACTUALIZADA
          </span>
        </div>
        <div className="tracking-layout">
          <div className="panel map-panel map-interactive">
            <div className="map-toolbar map-toolbar-google">
              <div className="map-modes">
                <button
                  className={modo === "roadmap" ? "map-active" : ""}
                  onClick={() => setModo("roadmap")}
                >
                  Estandar
                </button>
                <button
                  className={modo === "satellite" ? "map-active" : ""}
                  onClick={() => setModo("satellite")}
                >
                  Satelite
                </button>
                <button
                  className={modo === "terrain" ? "map-active" : ""}
                  onClick={() => setModo("terrain")}
                >
                  Relieve
                </button>
              </div>
              <button
                className={trafico ? "map-active" : ""}
                onClick={() => setTrafico((v) => !v)}
              >
                Trafico {trafico ? "ON" : "OFF"}
              </button>
              <button
                className={relieve3d ? "map-active" : ""}
                onClick={() => setRelieve3d((v) => !v)}
              >
                3D {relieve3d ? "ON" : "OFF"}
              </button>
              <button onClick={() => setReplay((r) => r + 1)}>
                Repetir recorrido
              </button>
            </div>
            <div className="mapa-lienzo">
              <Map
                key={`${pedido.id}-${replay}`}
                mapId={MAP_ID_DEMO}
                defaultCenter={centroMedio}
                defaultZoom={5}
                mapTypeId={modo}
                gestureHandling="greedy"
                className="real-map"
              >
                <CapaTrafico activa={trafico} />
                <RutaAnimada
                  origen={origen}
                  destino={destino}
                  avance={avance}
                  modo={modo}
                  relieve3d={relieve3d}
                />
                <AdvancedMarker position={origen} title={origen.nombre}>
                  <Pin background="#00E5FF" borderColor="#062b36" glyphColor="#062b36" />
                </AdvancedMarker>
                <AdvancedMarker position={destino} title={destino.nombre}>
                  <Pin background="#39FF6A" borderColor="#062b36" glyphColor="#062b36" />
                </AdvancedMarker>
                <AdvancedMarker
                  position={camion}
                  title={avance >= 1 ? `Camion en ${destino.nombre}` : `Camion ${trazado}%`}
                >
                  <div className="truck-marker">
                    {avance >= 1
                      ? `Camion en ${destino.nombre}`
                      : `Camion ${trazado}%`}
                  </div>
                </AdvancedMarker>
              </Map>
              <TrazoRecorrido origen={origen} destino={destino} avance={avance} />
            </div>
            <div className="map-status">
              <Package size={15} />{" "}
              {pedidoReal
                ? `Paquete ${pedido.progreso}% en ruta`
                : "Vista de previsualizacion"}{" "}
              · Trazo A → B {trazado}% · Origen: {origen.nombre} · Destino:{" "}
              {destino.nombre}
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
    </APIProvider>
  );
}

function CapaTrafico({ activa }) {
  const mapa = useMap();
  React.useEffect(() => {
    if (!mapa || !window.google) return;
    const capa = new window.google.maps.TrafficLayer();
    if (activa) capa.setMap(mapa);
    return () => capa.setMap(null);
  }, [mapa, activa]);
  return null;
}

// ==== Respaldo sin clave: teselas OpenStreetMap dibujadas dentro de un SVG ====
const TESELA = 256;
const URL_TESELA = "https://tile.openstreetmap.org";
const ZOOM_TESELAS = { min: 3, max: 8 };
// Proyeccion Web Mercator ("slippy map"): lat/lng -> pixeles del mundo.
function fnProyectarTesela(punto, zoom) {
  const escala = TESELA * Math.pow(2, zoom);
  const rad = (Math.max(-85, Math.min(85, punto.lat)) * Math.PI) / 180;
  return {
    x: ((punto.lng + 180) / 360) * escala,
    y: ((1 - Math.log(Math.tan(Math.PI / 4 + rad / 2)) / Math.PI) / 2) * escala,
  };
}
// Vista (viewBox) centrada en la ruta y teselas que cubren el panel.
function fnVistaTeselas(puntos, zoom, ancho, alto) {
  const proyectados = puntos.map((punto) => fnProyectarTesela(punto, zoom));
  const xs = proyectados.map((punto) => punto.x);
  const ys = proyectados.map((punto) => punto.y);
  const x0 = (Math.min(...xs) + Math.max(...xs)) / 2 - ancho / 2;
  const y0 = (Math.min(...ys) + Math.max(...ys)) / 2 - alto / 2;
  const mundo = Math.pow(2, zoom);
  const teselas = [];
  const ultimaY = Math.min(mundo - 1, Math.floor((y0 + alto) / TESELA));
  for (let ty = Math.max(0, Math.floor(y0 / TESELA)); ty <= ultimaY; ty += 1) {
    for (let tx = Math.floor(x0 / TESELA); tx <= Math.floor((x0 + ancho) / TESELA); tx += 1) {
      if (tx < 0 || tx >= mundo) continue;
      teselas.push({
        clave: `${zoom}-${tx}-${ty}`,
        url: `${URL_TESELA}/${zoom}/${tx}/${ty}.png`,
        x: tx * TESELA,
        y: ty * TESELA,
      });
    }
  }
  return { x0, y0, teselas, proyectados };
}
// Zoom mas cercano en el que el recorrido entra en el panel; se deja margen
// arriba (barra de herramientas) y abajo (barra del trazo) para que los pines
// de origen y destino siempre queden visibles.
function fnZoomAjustado(puntos, ancho, alto) {
  for (let z = ZOOM_TESELAS.max; z > ZOOM_TESELAS.min; z -= 1) {
    const inicio = fnProyectarTesela(puntos[0], z);
    const fin = fnProyectarTesela(puntos[puntos.length - 1], z);
    if (
      Math.abs(fin.y - inicio.y) <= alto * 0.58 &&
      Math.abs(fin.x - inicio.x) <= ancho * 0.58
    ) {
      return z;
    }
  }
  return ZOOM_TESELAS.min;
}
// Largo total del trazo ya proyectado a pixeles.
function fnLargoTrazo(puntos) {
  let total = 0;
  for (let i = 1; i < puntos.length; i += 1) {
    total += Math.hypot(puntos[i].x - puntos[i - 1].x, puntos[i].y - puntos[i - 1].y);
  }
  return total;
}
// Punto del camion sobre el trazo segun el avance 0..1.
function fnPuntoEnTrazo(puntos, avance, largo) {
  const meta = largo * Math.min(1, Math.max(0, avance));
  let recorrido = 0;
  for (let i = 1; i < puntos.length; i += 1) {
    const segmento = Math.hypot(puntos[i].x - puntos[i - 1].x, puntos[i].y - puntos[i - 1].y);
    if (recorrido + segmento >= meta) {
      const t = segmento ? (meta - recorrido) / segmento : 0;
      return {
        x: puntos[i - 1].x + (puntos[i].x - puntos[i - 1].x) * t,
        y: puntos[i - 1].y + (puntos[i].y - puntos[i - 1].y) * t,
      };
    }
    recorrido += segmento;
  }
  return puntos[puntos.length - 1];
}
function fnTrazadoSvg(puntos) {
  return puntos
    .map((punto, i) => `${i ? "L" : "M"}${punto.x.toFixed(1)} ${punto.y.toFixed(1)}`)
    .join(" ");
}
function MapaRespaldo({ pedido, pedidoReal }) {
  const origen = ORIGEN_RUTA;
  const destino = fnDestinoPedido(pedido.destino);
  const [zoomFijo, setZoomFijo] = useState(0); // 0 = ajuste automatico al recorrido
  const [recargar, setRecargar] = useState(0);
  const [medida, setMedida] = useState({ ancho: 960, alto: 520 });
  const panelRef = React.useRef(null);
  // El recorrido se traza solo de A a B (y se repite con el boton del panel).
  const avance = useTrazoRecorrido(
    `${pedido.id}-${recargar}-${pedidoKey(origen, destino)}`,
    5600,
  );
  // Mide el panel para calcular la ventana de mapa y el zoom justos.
  React.useEffect(() => {
    const nodo = panelRef.current;
    if (!nodo || typeof ResizeObserver === "undefined") return;
    const medir = () => {
      const caja = nodo.getBoundingClientRect();
      setMedida({
        ancho: Math.max(320, Math.round(caja.width)),
        alto: Math.max(240, Math.round(caja.height)),
      });
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);
  const puntos = React.useMemo(
    () => fnPuntosRuta(origen, destino, 160),
    [origen.lat, origen.lng, destino.lat, destino.lng],
  );
  const zoom = zoomFijo || fnZoomAjustado(puntos, medida.ancho, medida.alto);
  const vista = fnVistaTeselas(puntos, zoom, medida.ancho, medida.alto);
  const largo = fnLargoTrazo(vista.proyectados);
  const camion = fnPuntoEnTrazo(vista.proyectados, avance, largo);
  const trazado = Math.round(avance * 100);
  const inicio = vista.proyectados[0];
  const fin = vista.proyectados[vista.proyectados.length - 1];
  const etiquetaCamion =
    avance >= 1 ? `Camion en ${destino.nombre}` : `Camion ${trazado}%`;
  const anchoEtiqueta = 18 + etiquetaCamion.length * 6.4;
  const izquierda = camion.x + 20 + anchoEtiqueta > vista.x0 + medida.ancho;
  const fichaX = izquierda ? -anchoEtiqueta - 20 : 20;
  // Si la etiqueta del pin no cabe a la derecha, se dibuja hacia la izquierda.
  const cabeDerecha = (punto, texto) =>
    punto.x + 12 + 16 + texto.length * 6.6 <= vista.x0 + medida.ancho;
  const origenDerecha = cabeDerecha(inicio, origen.nombre);
  const destinoDerecha = cabeDerecha(fin, destino.nombre);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SEGUIMIENTO EN TIEMPO REAL</p>
          <h1>Ubicacion del paquete</h1>
          <p className="muted">
            Sin clave Google Maps: mapa de respaldo OpenStreetMap con el
            recorrido trazado de A a B.
          </p>
        </div>
        <span className="date-chip">
          <i className="live-dot" /> MODO DEMO SIN KEY
        </span>
      </div>
      <div className="tracking-layout">
        <div className="panel map-panel map-interactive">
          <div className="map-toolbar">
            <button
              title="Acercar"
              onClick={() => setZoomFijo(Math.min(ZOOM_TESELAS.max, zoom + 1))}
            >
              +
            </button>
            <button
              title="Alejar"
              onClick={() => setZoomFijo(Math.max(ZOOM_TESELAS.min, zoom - 1))}
            >
              -
            </button>
            <button title="Ver el recorrido completo" onClick={() => setZoomFijo(0)}>
              Ajustar
            </button>
            <button onClick={() => setRecargar((actual) => actual + 1)}>
              Repetir recorrido
            </button>
            <span>
              Zoom {zoom} · Trazo {trazado}%
            </span>
          </div>
          <div className="real-map real-map-teselas" ref={panelRef}>
            <svg
              className="mapa-svg"
              viewBox={`${vista.x0} ${vista.y0} ${medida.ancho} ${medida.alto}`}
            >
              {vista.teselas.map((tesela) => (
                <image
                  key={tesela.clave}
                  href={tesela.url}
                  x={tesela.x}
                  y={tesela.y}
                  width={TESELA}
                  height={TESELA}
                />
              ))}
              <path className="mapa-ruta" d={fnTrazadoSvg(vista.proyectados)} />
              <path
                className="mapa-trazo-linea"
                d={fnTrazadoSvg(vista.proyectados)}
                strokeDasharray={`${largo.toFixed(1)}`}
                strokeDashoffset={`${(largo * (1 - avance)).toFixed(1)}`}
              />
              <circle className="mapa-pin mapa-pin-origen" cx={inicio.x} cy={inicio.y} r={7} />
              <text
                className="mapa-etiqueta"
                x={inicio.x + (origenDerecha ? 12 : -12)}
                y={inicio.y + 4}
                style={{ textAnchor: origenDerecha ? "start" : "end" }}
              >
                {origen.nombre}
              </text>
              <circle className="mapa-pin mapa-pin-destino" cx={fin.x} cy={fin.y} r={7} />
              <text
                className="mapa-etiqueta"
                x={fin.x + (destinoDerecha ? 12 : -12)}
                y={fin.y + 4}
                style={{ textAnchor: destinoDerecha ? "start" : "end" }}
              >
                {destino.nombre}
              </text>
              <g transform={`translate(${camion.x.toFixed(1)} ${camion.y.toFixed(1)})`}>
                <circle className="mapa-camion-halo" r={10} />
                <circle className="mapa-camion-punto" r={5.5} />
                <rect
                  className="mapa-camion-ficha"
                  x={fichaX}
                  y={-11}
                  width={anchoEtiqueta}
                  height={22}
                  rx={11}
                />
                <text
                  className="mapa-camion-texto"
                  x={fichaX + anchoEtiqueta / 2}
                  y={4}
                >
                  {etiquetaCamion}
                </text>
              </g>
            </svg>
            <a
              className="mapa-creditos"
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              © OpenStreetMap
            </a>
            <TrazoRecorrido origen={origen} destino={destino} avance={avance} />
          </div>
          <div className="map-status">
            <Package size={15} />{" "}
            {pedidoReal
              ? `Paquete ${pedido.progreso}% en ruta`
              : "Vista de previsualizacion"}{" "}
            · Trazo A → B {trazado}% · Origen: {origen.nombre} · Destino:{" "}
            {destino.nombre}
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
