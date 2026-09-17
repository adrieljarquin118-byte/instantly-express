import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { io } from "socket.io-client";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://instantly-express-production.up.railway.app/api";
const API = String(API_URL).replace(/\/$/, "");
const Tab = createBottomTabNavigator();
const colores = {
  fondo: "#0B0E14",
  panel: "#151A24",
  input: "#1E2530",
  cian: "#00E5FF",
  naranja: "#FF7A1A",
  verde: "#39FF6A",
  texto: "#F2F5F9",
  secundario: "#8B93A7",
  borde: "#252C3A",
};
const placeholderJpg = require("../assets/logo-completo-640.png");
const USUARIO_LIBRE = {
  id: 1,
  nombre: "María",
  apellidos: "Comercio",
  correo: "cliente@demo.com",
  rol: "cliente",
};

function App() {
  const [sesion, setSesion] = useState({
    token: "libre",
    usuario: USUARIO_LIBRE,
  });
  const [productos, setProductos] = useState([
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
      descripcion: "Acceso mayorista para catálogos digitales.",
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
      descripcion: "Kit compacto para creadores y vitrinas.",
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
      descripcion: "Presentación premium para oficinas y eventos.",
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
      descripcion: "Alta rotación para venta minorista.",
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
      descripcion: "Gestión de campanas digitales.",
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
      descripcion: "Audio cerrado para streaming y edición.",
    },
  ]);
  const [carrito, setCarrito] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [conectado, setConectado] = useState(false);
  async function pedir(ruta, opciones = {}) {
    if (!sesion?.token || sesion.token === "libre")
      throw new Error("Modo libre: sin backend");
    const respuesta = await fetch(`${API}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {}),
        ...(opciones.headers || {}),
      },
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.mensaje || `Error ${respuesta.status}`);
    return datos;
  }
  useEffect(() => {
    pedir("/productos")
      .then((datos) => {
        if (Array.isArray(datos) && datos.length > 0) setProductos(datos);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!sesion?.token || sesion.token === "libre") return undefined;
    pedir("/carrito").then(setCarrito).catch(() => {});
    pedir("/pedidos").then(setPedidos).catch(() => {});
    const socket = io(API.replace(/\/api$/, ""));
    socket.on("connect", () => setConectado(true));
    socket.on("disconnect", () => setConectado(false));
    socket.on("carrito:actualizado", () =>
      Alert.alert("Stock actualizado", "El inventario cambió en tiempo real."),
    );
    return () => socket.disconnect();
  }, [sesion]);
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colores.cian,
          tabBarInactiveTintColor: colores.secundario,
        }}
      >
        <Tab.Screen name="Inicio">
          {() => (
            <Inicio
              usuario={sesion.usuario}
              pedidos={pedidos}
              conectado={conectado}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Catálogo">
          {() => (
            <Catalogo
              productos={productos}
              agregar={async (producto) => {
                if (!sesion?.token || sesion.token === "libre") {
                  setCarrito((actual) => {
                    const linea = actual.find(
                      (item) => item.idProducto === producto.id,
                    );
                    if (linea)
                      return actual.map((item) =>
                        item.idProducto === producto.id
                          ? {
                              ...item,
                              cantidad: item.cantidad + producto.minimo,
                            }
                          : item,
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
                  Alert.alert("Carrito", "Producto agregado.");
                  return;
                }
                try {
                  setCarrito(
                    await pedir("/carrito/agregar", {
                      method: "POST",
                      body: JSON.stringify({
                        idProducto: producto.id,
                        cantidad: producto.minimo,
                      }),
                    }),
                  );
                  Alert.alert("Carrito", "Producto agregado correctamente.");
                } catch (e) {
                  Alert.alert("No se pudo agregar", e.message);
                }
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Carrito">
          {() => (
            <Carrito
              carrito={carrito}
              productos={productos}
              confirmar={async () => {
                if (!sesion?.token || sesion.token === "libre") {
                  if (carrito.length === 0) {
                    Alert.alert("Carrito vacío", "Agrega productos primero.");
                    return;
                  }
                  const total = carrito.reduce(
                    (suma, linea) =>
                      suma + linea.producto.precio * linea.cantidad,
                    0,
                  );
                  const pedidoLibre = {
                    id: `IE-${Date.now().toString().slice(-6)}`,
                    fecha: new Date().toISOString().slice(0, 10),
                    estado: "pendiente",
                    progreso: 10,
                    total,
                    destino: "San Salvador",
                    envio: "Express",
                  };
                  setPedidos([pedidoLibre, ...pedidos]);
                  setCarrito([]);
                  Alert.alert(
                    "Pedido creado",
                    `Tu pedido ${pedidoLibre.id} quedó pendiente.`,
                  );
                  return;
                }
                try {
                  const pedido = await pedir("/pedidos", {
                    method: "POST",
                    body: JSON.stringify({
                      tipoEnvio: "Express",
                      destino: "San Salvador",
                    }),
                  });
                  setPedidos([pedido, ...pedidos]);
                  setCarrito([]);
                  Alert.alert(
                    "Pedido creado",
                    `Tu pedido ${pedido.id} quedó pendiente de confirmación.`,
                  );
                } catch (e) {
                  Alert.alert("Carrito", e.message);
                }
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Pedidos">
          {() => <Pedidos pedidos={pedidos} />}
        </Tab.Screen>
        <Tab.Screen name="Perfil">
          {() => (
            <Perfil
              usuario={sesion.usuario}
              salir={() => setSesion({ token: "libre", usuario: USUARIO_LIBRE })}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
function Login({ onLogin }) {
  const [correo, setCorreo] = useState("cliente@demo.com");
  const [contrasena, setContrasena] = useState("123456");
  async function entrar() {
    try {
      const respuesta = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.mensaje);
      onLogin(datos);
    } catch (e) {
      Alert.alert("Acceso", e.message);
    }
  }
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.login}>
        <View style={styles.logo}>
          <Image
            source={{ uri: placeholderJpg }}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Text style={styles.logoName}>Instantly{`\n`}Express</Text>
        </View>
        <Text style={styles.eyebrow}>CENTRO DE OPERACIONES</Text>
        <Text style={styles.title}>Entra a tu red comercial</Text>
        <Text style={styles.muted}>
          Catálogos, mayoreo y entregas en una sola vista.
        </Text>
        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />
        <Pressable style={styles.primary} onPress={entrar}>
          <Text style={styles.primaryText}>Iniciar sesión →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
function Inicio({ usuario, pedidos, conectado }) {
  const activo = pedidos.filter((item) => item.estado !== "entregado").length;
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.page}
        data={pedidos.filter((item) => item.estado === "en_transito")}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.mobileHeader}>
              <View>
                <Text style={styles.eyebrow}>PANEL DE CONTROL</Text>
                <Text style={styles.title}>Hola, {usuario.nombre}</Text>
              </View>
              <View style={styles.live}>
                <Text style={conectado ? styles.liveText : styles.offlineText}>
                  ● {conectado ? "EN VIVO" : "OFFLINE"}
                </Text>
              </View>
            </View>
            <View style={styles.kpiRow}>
              <Kpi label="Activos" value={activo} />
              <Kpi
                label="En tránsito"
                value={
                  pedidos.filter((item) => item.estado === "en_transito").length
                }
              />
              <Kpi label="Alertas" value="03" />
            </View>
            <Text style={styles.sectionTitle}>Pedidos en tránsito</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.shipment}>
            <View style={styles.shipmentTop}>
              <Text style={styles.bold}>{item.id}</Text>
              <Text style={styles.cyan}>{item.progreso}%</Text>
            </View>
            <Text style={styles.muted}>
              {item.envio} · {item.destino}
            </Text>
            <View style={styles.progress}>
              <View
                style={[styles.progressFill, { width: `${item.progreso}%` }]}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.muted}>No hay pedidos en tránsito.</Text>
        }
      />{" "}
    </SafeAreaView>
  );
}
function Kpi({ label, value }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}
function Catalogo({ productos, agregar }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const categorias = useMemo(
    () => ["Todas", ...new Set(productos.map((item) => item.categoria))],
    [productos]
  );
  const visibles = productos.filter((item) => {
    const coincideTexto =
      `${item.nombre} ${item.proveedor} ${item.categoria}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoria === "Todas" || item.categoria === categoria;
    return coincideTexto && coincideCategoria;
  });
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>INVENTARIO MULTIPROVEEDOR</Text>
        <Text style={styles.title}>Catálogo</Text>
        <Text style={styles.muted}>Compra por volumen con fotos reales.</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar productos o proveedores..."
          placeholderTextColor={colores.secundario}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <View style={styles.chips}>
          {categorias.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategoria(item)}
              style={[
                styles.chip,
                categoria === item ? styles.chipActivo : null,
              ]}
            >
              <Text
                style={
                  categoria === item ? styles.chipTextoActivo : styles.chipTexto
                }
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <FlatList
          contentContainerStyle={styles.grid}
          data={visibles}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.muted}>Sin resultados para esa búsqueda.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.product}>
              <View style={styles.productArt}>
                <Image
                  source={
                    item.imagen ? { uri: item.imagen } : placeholderJpg
                  }
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.productName}>{item.nombre}</Text>
              <Text style={styles.muted}>{item.proveedor}</Text>
              <Text style={styles.price}>${item.precio.toFixed(2)}</Text>
              <Text style={styles.muted}>Mín. {item.minimo}</Text>
              <Pressable
                style={styles.smallButton}
                onPress={() => agregar(item)}
              >
                <Text style={styles.smallButtonText}>＋ Agregar</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
function Carrito({ carrito, productos, confirmar }) {
  const lineas = carrito
    .map((linea) => ({
      ...linea,
      producto:
        linea.producto || productos.find((item) => item.id === linea.idProducto),
    }))
    .filter((item) => item.producto);
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.page}
        data={lineas}
        keyExtractor={(item) => item.idDetalle}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>RESERVA DE EXISTENCIAS</Text>
            <Text style={styles.title}>Tu carrito</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cartLine}>
            <View>
              <Text style={styles.bold}>{item.producto.nombre}</Text>
              <Text style={styles.muted}>{item.cantidad} unidades</Text>
            </View>
            <Text style={styles.price}>
              ${(item.cantidad * item.producto.precio).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.muted}>Tu carrito está vacío.</Text>
        }
        ListFooterComponent={
          lineas.length ? (
            <Pressable style={styles.primary} onPress={confirmar}>
              <Text style={styles.primaryText}>Confirmar pedido →</Text>
            </Pressable>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
function Pedidos({ pedidos }) {
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.page}
        data={pedidos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>HISTORIAL OPERATIVO</Text>
            <Text style={styles.title}>Pedidos</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.order}>
            <View style={styles.shipmentTop}>
              <Text style={styles.bold}>{item.id}</Text>
              <Text style={styles.cyan}>{item.estado}</Text>
            </View>
            <Text style={styles.muted}>
              {item.envio} · {item.destino}
            </Text>
            <View style={styles.progress}>
              <View
                style={[styles.progressFill, { width: `${item.progreso}%` }]}
              />
            </View>
          </View>
        )}
      />{" "}
    </SafeAreaView>
  );
}
function Perfil({ usuario, salir }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>CUENTA</Text>
        <Text style={styles.title}>Perfil</Text>
        <View style={styles.profile}>
          <Text style={styles.avatar}>{usuario.nombre[0]}</Text>
          <Text style={styles.bold}>{usuario.nombre}</Text>
          <Text style={styles.muted}>{usuario.correo}</Text>
        </View>
        <Pressable style={styles.secondary} onPress={salir}>
          <Text style={styles.secondaryText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colores.fondo },
  page: { padding: 20, paddingBottom: 35 },
  login: {
    margin: 18,
    padding: 22,
    backgroundColor: colores.panel,
    borderRadius: 12,
    borderTopWidth: 2,
    borderTopColor: colores.cian,
  },
  logo: {
    backgroundColor: "#F2F5F9",
    alignItems: "center",
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  logoIe: { color: "#253e43", fontSize: 38, fontWeight: "700" },
  logoName: {
    color: "#253e43",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  eyebrow: {
    color: colores.cian,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    color: colores.texto,
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 8,
  },
  muted: { color: colores.secundario, fontSize: 12, marginVertical: 3 },
  label: { color: colores.secundario, marginTop: 18, fontSize: 12 },
  input: {
    backgroundColor: colores.input,
    color: colores.texto,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: 7,
    padding: 12,
    marginTop: 7,
    marginBottom: 13,
  },
  primary: {
    backgroundColor: colores.cian,
    padding: 14,
    borderRadius: 7,
    alignItems: "center",
    marginTop: 20,
  },
  primaryText: { color: colores.fondo, fontWeight: "700" },
  mobileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  live: {
    padding: 7,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: 5,
  },
  liveText: { color: colores.cian, fontSize: 10 },
  offlineText: { color: colores.secundario, fontSize: 10 },
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 28 },
  kpi: {
    backgroundColor: colores.panel,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: 8,
    padding: 13,
    flex: 1,
  },
  kpiValue: {
    color: colores.texto,
    fontSize: 23,
    fontWeight: "700",
    marginTop: 9,
  },
  sectionTitle: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  shipment: {
    backgroundColor: colores.panel,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: 9,
    padding: 16,
    marginBottom: 10,
  },
  shipmentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bold: { color: colores.texto, fontWeight: "700", fontSize: 13 },
  cyan: { color: colores.cian, fontWeight: "700" },
  progress: {
    height: 5,
    backgroundColor: colores.borde,
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: 5, backgroundColor: colores.cian },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colores.panel,
  },
  chipActivo: {
    backgroundColor: colores.cian,
    borderColor: colores.cian,
  },
  chipTexto: { color: colores.secundario, fontSize: 11 },
  chipTextoActivo: { color: "#081017", fontSize: 11, fontWeight: "700" },
  grid: { gap: 9, paddingTop: 6 },
  product: {
    backgroundColor: colores.panel,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    margin: 4,
    flex: 1,
  },
  productArt: {
    height: 110,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#10151E",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  cartThumb: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  productName: {
    color: colores.texto,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
    minHeight: 34,
  },
  price: { color: colores.texto, fontWeight: "700", marginTop: 8 },
  smallButton: {
    borderColor: colores.cian,
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    alignItems: "center",
    marginTop: 10,
  },
  smallButtonText: { color: colores.cian, fontSize: 11 },
  cartLine: {
    backgroundColor: colores.panel,
    padding: 12,
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  order: {
    backgroundColor: colores.panel,
    padding: 16,
    borderRadius: 8,
    borderColor: colores.borde,
    borderWidth: 1,
    marginBottom: 10,
  },
  profile: {
    backgroundColor: colores.panel,
    alignItems: "center",
    padding: 28,
    borderRadius: 9,
    marginTop: 15,
  },
  avatar: {
    color: colores.fondo,
    backgroundColor: colores.cian,
    borderRadius: 40,
    padding: 17,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14,
  },
  secondary: {
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: 7,
    padding: 14,
    alignItems: "center",
    marginTop: 18,
  },
  secondaryText: { color: colores.texto },
  tabBar: {
    backgroundColor: colores.panel,
    borderTopColor: colores.borde,
    height: 62,
    paddingBottom: 6,
  },
});
