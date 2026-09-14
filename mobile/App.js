import React, { useEffect, useState } from "react";
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
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { io } from "socket.io-client";

const API = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4010/api";
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

function App() {
  const [sesion, setSesion] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [conectado, setConectado] = useState(false);
  async function pedir(ruta, opciones = {}) {
    const respuesta = await fetch(`${API}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}),
      },
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje);
    return datos;
  }
  useEffect(() => {
    pedir("/productos")
      .then(setProductos)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!sesion) return;
    pedir("/carrito").then(setCarrito);
    pedir("/pedidos").then(setPedidos);
    const socket = io(API.replace("/api", ""));
    socket.on("connect", () => setConectado(true));
    socket.on("disconnect", () => setConectado(false));
    socket.on("carrito:actualizado", () =>
      Alert.alert("Stock actualizado", "El inventario cambió en tiempo real."),
    );
    return () => socket.disconnect();
  }, [sesion]);
  if (!sesion) return <Login onLogin={setSesion} />;
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
            <Perfil usuario={sesion.usuario} salir={() => setSesion(null)} />
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
  const visibles = productos.filter((item) =>
    item.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>INVENTARIO MULTIPROVEEDOR</Text>
        <Text style={styles.title}>Catálogo</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar referencias..."
          placeholderTextColor={colores.secundario}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <FlatList
          contentContainerStyle={styles.grid}
          data={visibles}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.product}>
              <View
                style={[styles.productArt, { backgroundColor: item.color }]}
              >
                <Image
                  source={{ uri: item.imagen || placeholderJpg }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <Text style={styles.artText}>JPG</Text>
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
      producto: productos.find((item) => item.id === linea.idProducto),
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
  grid: { gap: 9, paddingTop: 15 },
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
    height: 90,
    borderRadius: 6,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 8,
  },
  artText: { color: "#081017", fontSize: 30, fontWeight: "700" },
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
    padding: 15,
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
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
