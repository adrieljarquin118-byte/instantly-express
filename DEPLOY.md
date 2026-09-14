# Despliegue en Railway — Instantly Express

Guía completa paso a paso para subir este proyecto a Railway usando GitHub.

---

## Parte 1: Preparar el repositorio en GitHub

### 1.1 Crear el repositorio en GitHub

1. Ve a **https://github.com/new**
2. **Nombre del repositorio:** `instantly-express`
3. **Visibilidad:** Privado o Público (tú decides)
4. **NO** marques _"Initialize this repository with a README"_ (ya tienes uno)
5. Click en **"Create repository"**

### 1.2 Subir el proyecto desde tu terminal

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Inicial: Instantly Express completo"
git branch -M main
git remote add origin https://github.com/adrieljarquin118-byte/instantly-express.git
git push -u origin main
```

> **Nota:** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.
>
> Tu `.gitignore` ya excluye `node_modules/`, `backend/.env`, `web/dist/` y `mobile/.expo/`, así que esos archivos **no** se subirán.

---

## Parte 2: Crear la aplicación en Railway

1. Ve a **https://railway.app**
2. Click en **"Login with GitHub"** (recomendado) o regístrate con tu correo
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Conecta tu cuenta de GitHub si aún no está conectada
6. Selecciona el repositorio `instantly-express`

---

## Parte 3: Crear el servicio del Backend

### 3.1 Crear el servicio

1. En Railway, click en **"New" → "Add Service"**
2. Selecciona tu repositorio `instantly-express`
3. Railway te preguntará qué carpeta desplegar — selecciona **`backend/`**

### 3.2 Configurar el servicio del backend

| Configuración      | Valor                                      |
| ------------------ | ------------------------------------------ |
| **Root Directory** | `backend`                                  |
| **Build Command**  | `npm install`                              |
| **Start Command**  | `npm start`                                |
| **Puerto**         | Railway lo asigna automáticamente (`PORT`) |

> **Importante:** El backend ya lee `process.env.PORT` (estándar de Railway). Si quieres usar otro puerto, define la variable `PUERTO`.

### 3.3 Variables de entorno del backend

Ve a la pestaña **Variables** del servicio backend y agrega:

```
PORT=4010
JWT_SECRETO=elige_un_secreto_largo_y_seguro
```

### 3.4 Conectar MySQL (Plugin)

1. Click en **"New" → "Database" → "Add MySQL"**
2. Railway creará una base MySQL con una URL automática tipo:
   ```
   mysql://usuario:contrasena@host:puerto/nombre_base
   ```
3. Copia esa URL y agrégala como variable en el backend:
   ```
   MYSQL_URL=mysql://usuario:contrasena@host:puerto/nombre_base
   MYSQL_BASE_DATOS=SisInstantlyExpress
   ```
4. Railway también expone las variables `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` automáticamente.

> **Importante:** Si el plugin MySQL se crea **después** de crear el servicio, Railway te preguntará si quieres enlazarlo automáticamente. Acepta para que las variables se inyecten solas.

### 3.5 URL pública del backend

Railway generará una URL tipo:

```
https://instantly-express-backend-production.up.railway.app
```

Guarda esta URL — la necesitarás para la web.

---

## Parte 4: Crear el servicio del Frontend Web

### 4.1 Crear el servicio

1. Click en **"New" → "Add Service"**
2. Selecciona el mismo repositorio `instantly-express`
3. Selecciona la carpeta **`web/`**

### 4.2 Configurar el servicio web

| Configuración      | Valor                          |
| ------------------ | ------------------------------ |
| **Root Directory** | `web`                          |
| **Build Command**  | `npm install && npm run build` |
| **Start Command**  | `npm run preview`              |
| **Puerto**         | 5173                           |

### 4.3 Variables de entorno de la web

```
VITE_API_URL=https://instantly-express-backend-production.up.railway.app
```

> ⚠️ **CRÍTICO:** Sin esta variable, la web intentará usar `http://localhost:4010` y no funcionará en producción. Reemplaza con la URL real de tu backend.

### 4.4 URL pública de la web

Railway generará una URL tipo:

```
https://instantly-express-web-production.up.railway.app
```

---

## Parte 5: Configurar dominio personalizado (opcional)

1. En el servicio web o backend, ve a **Settings → Domains**
2. Click en **"Generate Domain"** para obtener un dominio `*.up.railway.app` gratis
3. Si tienes tu propio dominio, click en **"Add Custom Domain"** y sigue las instrucciones DNS

---

## Parte 6: Despliegue automático (CI/CD)

Railway se conecta a GitHub automáticamente:

1. Ve a **Settings** del servicio
2. Busca la sección **"GitHub"** → verás **"Auto Deploy"**
3. Está activado por defecto — cada vez que hagas `push` a `main`, Railway redeploya automáticamente

Para actualizar tu aplicación:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

---

## Parte 7: Verificar el despliegue

1. **Backend:** Abre `https://tu-backend.up.railway.app/api/salud` — debe responder con JSON
2. **Web:** Abre `https://tu-web.up.railway.app` — debe mostrar el login
3. **Credenciales demo:**
   - Cliente: `cliente@demo.com` / `123456`
   - Admin: `admin@demo.com` / `admin123`

---

## Parte 8: Archivos ya creados para Railway

Ya dejé listo `railway.json` en la raíz del proyecto:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm --prefix backend run start",
    "healthcheckPath": "/api/salud",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Este archivo asegura que Railway:

- Use `Nixpacks` para detectar Node.js automáticamente
- Ejecute el backend con `npm start`
- Verifique la salud del servicio con `/api/salud`
- Reinicie automáticamente si falla

---

## Notas importantes para Railway

| Tema          | Detalle                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------- |
| **Monorepo**  | Railway permite seleccionar el subdirectorio (Root Directory) por servicio                   |
| **MySQL**     | Agrega el plugin MySQL de Railway y copia `MYSQL_URL` al backend                             |
| **Socket.IO** | Railway soporta WebSockets. Usa **1 réplica** (no más) para que Socket.IO funcione sin Redis |
| **Puerto**    | Railway inyecta `PORT` automáticamente. El backend ya lo lee                                 |
| **Variables** | Toda variable sensible (JWT, MySQL) va en Railway, nunca en el código                        |
| **Frontend**  | La web se sirve con `npm run preview` (Vite preview)                                         |

---

## Resumen rápido

```bash
# 1. Subir a GitHub
git init
git add .
git commit -m "Inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/instantly-express.git
git push -u origin main

# 2. En Railway
# - Crea proyecto desde GitHub
# - Agrega servicio backend/  (root: backend, start: npm start)
# - Agrega servicio web/      (root: web, build: npm run build, start: npm run preview)
# - Agrega MySQL plugin y enlaza al backend
# - Define VITE_API_URL en web apuntando al backend de Railway
# - Railway genera URLs automáticamente
```

---

## Solución de problemas

| Problema                  | Solución                                                                     |
| ------------------------- | ---------------------------------------------------------------------------- |
| La web no carga productos | Verifica que `VITE_API_URL` apunte a la URL del backend en Railway           |
| El backend no arranca     | Revisa los logs en Railway. Asegúrate de que el Root Directory sea `backend` |
| Error de MySQL            | Verifica que las variables `MYSQL_URL` o `MYSQLHOST` estén configuradas      |
| Socket.IO no conecta      | Usa solo 1 réplica en Railway                                                |
| Puerto en uso             | Railway asigna `PORT` automáticamente; el backend ya lo lee                  |
| La app móvil no conecta   | En Expo, define `EXPO_PUBLIC_API_URL` con la URL de Railway                  |
