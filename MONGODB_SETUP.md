# 🗄️ Guía de Configuración de MongoDB

## Opción 1: MongoDB Atlas (Cloud - Recomendado) ☁️

### Paso 1: Crear cuenta en MongoDB Atlas

1. **Ve a MongoDB Atlas:**
   - Abre: https://www.mongodb.com/cloud/atlas/register
   - O desde la imagen que tienes: https://cloud.mongodb.com/

2. **Regístrate:**
   - Haz clic en "Sign Up" o "Get started free"
   - Puedes usar tu email o cuenta de Google/GitHub
   - Completa el formulario de registro

3. **Verifica tu email** (si es necesario)

---

### Paso 2: Crear un Cluster Gratuito

1. **Una vez dentro del dashboard:**
   - Verás un botón verde "Build a Database" o "Create a cluster"
   - Haz clic en él

2. **Selecciona el plan FREE (M0):**
   - Elige "M0 Sandbox" (gratis para siempre)
   - Haz clic en "Create"

3. **Configuración del cluster:**
   - **Cloud Provider:** Elige el que prefieras (AWS, Google Cloud, Azure)
   - **Region:** Elige la más cercana a ti (ej: `eu-west-1` para España)
   - **Cluster Name:** Déjalo por defecto o ponle un nombre (ej: "healthy-app-cluster")
   - Haz clic en "Create Cluster"

4. **Espera a que se cree:**
   - Tardará 3-5 minutos
   - Verás un mensaje "Your cluster is being created"

---

### Paso 3: Configurar Usuario de Base de Datos

1. **Mientras se crea el cluster, verás un modal "Create Database User":**
   - Si no aparece, ve a "Database Access" en el menú lateral izquierdo

2. **Crea un usuario:**
   - **Username:** Elige un nombre (ej: `healthyapp_user`)
   - **Password:** 
     - Haz clic en "Autogenerate Secure Password" (recomendado)
     - O crea tu propia contraseña segura
   - **IMPORTANTE:** ⚠️ **COPIA LA CONTRASEÑA** - la necesitarás después
   - Haz clic en "Add User"

---

### Paso 4: Configurar Acceso de Red (IP Whitelist)

1. **Ve a "Network Access" en el menú lateral izquierdo**

2. **Agrega tu IP:**
   - Haz clic en "Add IP Address"
   - Opción 1: "Add Current IP Address" (recomendado para desarrollo)
   - Opción 2: "Allow Access from Anywhere" (0.0.0.0/0) - Solo para desarrollo, NO para producción
   - Haz clic en "Confirm"

---

### Paso 5: Obtener Connection String

1. **Ve a "Clusters" en el menú lateral**
   - Deberías ver tu cluster creado

2. **Haz clic en "Connect" (botón verde)**

3. **Selecciona "Connect your application"**

4. **Copia el Connection String:**
   - Verás algo como:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Reemplaza los placeholders:**
   - `<username>` → Tu usuario creado (ej: `healthyapp_user`)
   - `<password>` → Tu contraseña (la que copiaste antes)
   - Ejemplo final:
   ```
   mongodb+srv://healthyapp_user:MiPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

### Paso 6: Configurar en tu Proyecto

1. **Abre tu archivo `.env`**

2. **Actualiza estas variables:**
   ```env
   # MongoDB Atlas (Cloud)
   MONGO_URI=mongodb+srv://healthyapp_user:MiPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=healthyappDB
   ```

   **IMPORTANTE:** 
   - Reemplaza `healthyapp_user` con tu usuario
   - Reemplaza `MiPassword123` con tu contraseña
   - Reemplaza `cluster0.xxxxx.mongodb.net` con tu URL real
   - Si tu contraseña tiene caracteres especiales, URL-encodéala (ej: `@` → `%40`)

3. **Guarda el archivo**

---

## Opción 2: MongoDB Local (Más Simple) 💻

Si prefieres usar MongoDB localmente (más rápido para desarrollo):

### Paso 1: Instalar MongoDB Localmente

**Windows:**
1. Descarga MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Instala el instalador `.msi`
3. Durante la instalación, marca "Install MongoDB as a Service"
4. Completa la instalación

**Verificar instalación:**
- Abre PowerShell o CMD
- Ejecuta: `mongod --version`
- Deberías ver la versión instalada

### Paso 2: Iniciar MongoDB

**Windows:**
- MongoDB debería iniciarse automáticamente como servicio
- Si no, ve a "Services" y busca "MongoDB" e inícialo

**Verificar que está corriendo:**
- Abre PowerShell o CMD
- Ejecuta: `mongosh` o `mongo`
- Deberías conectarte a MongoDB

### Paso 3: Configurar en tu Proyecto

1. **Abre tu archivo `.env`**

2. **Usa esta configuración:**
   ```env
   # MongoDB Local
   MONGO_URI=mongodb://127.0.0.1:27017
   DB_NAME=healthyappDB
   ```

3. **Guarda el archivo**

---

## 🔍 Verificar Conexión

1. **Inicia tu aplicación:**
   ```bash
   npm run dev
   ```

2. **Deberías ver en la consola:**
   ```
   Connected to db: healthyappDB
   ```

3. **Si ves un error:**
   - Verifica que la URL de conexión sea correcta
   - Verifica que MongoDB esté corriendo (si es local)
   - Verifica que tu IP esté en la whitelist (si es Atlas)
   - Verifica usuario y contraseña (si es Atlas)

---

## 🆘 Solución de Problemas Comunes

### Error: "Authentication failed"
- Verifica usuario y contraseña en el connection string
- Si la contraseña tiene caracteres especiales, URL-encodéala

### Error: "IP not whitelisted"
- Ve a "Network Access" en Atlas
- Agrega tu IP actual o usa `0.0.0.0/0` (solo desarrollo)

### Error: "Connection timeout"
- Verifica que MongoDB esté corriendo (si es local)
- Verifica tu conexión a internet (si es Atlas)
- Verifica que el cluster esté activo en Atlas

### Error: "Invalid connection string"
- Asegúrate de que el formato sea correcto
- No dejes espacios en el connection string
- Verifica que todos los caracteres especiales estén URL-encoded

---

## 📝 Resumen Rápido

**Para MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=healthyappDB
```

**Para MongoDB Local:**
```env
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=healthyappDB
```

---

¿Necesitas ayuda con algún paso específico? 🚀

