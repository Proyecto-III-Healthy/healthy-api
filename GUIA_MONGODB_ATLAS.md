# 🗄️ Guía Completa: MongoDB Atlas (Gratuito)

## ✅ Sí, MongoDB Atlas es GRATIS

MongoDB Atlas ofrece un **tier gratuito permanente** llamado **M0 (Free Tier)** con:
- ✅ **512 MB de almacenamiento** (suficiente para desarrollo y proyectos pequeños)
- ✅ **Shared RAM** (compartido pero suficiente)
- ✅ **Sin tarjeta de crédito requerida** (para tier gratuito)
- ✅ **Sin límite de tiempo** (permanente)
- ✅ **Backups automáticos** (limitados pero útiles)

**Limitaciones del tier gratuito:**
- ⚠️ Solo 1 cluster gratuito por cuenta
- ⚠️ 512 MB de almacenamiento máximo
- ⚠️ Sin opciones avanzadas (sharding, etc.)

**Para tu caso:** Es perfecto para desarrollo y proyectos pequeños/medianos.

---

## 🚀 Guía Paso a Paso

### Paso 1: Crear Cuenta en MongoDB Atlas

1. **Ve a MongoDB Atlas:**
   - URL: https://www.mongodb.com/cloud/atlas/register
   - O ve a: https://cloud.mongodb.com/ y haz clic en "Try Free"

2. **Regístrate:**
   - Puedes usar Google, GitHub o email
   - Completa el formulario de registro
   - Verifica tu email si es necesario

---

### Paso 2: Crear un Cluster Gratuito

1. **Después de registrarte, verás el asistente de creación:**
   - Selecciona: **"Build a Database"** o **"Create"**

2. **Elige el tipo de deployment:**
   - Selecciona: **"M0 FREE"** (Free Shared)
   - ⚠️ **IMPORTANTE:** Asegúrate de seleccionar M0 FREE, no M2 o M5 (esos son de pago)

3. **Selecciona el Cloud Provider y Región:**
   - **Provider:** AWS, Google Cloud o Azure (elige el más cercano a ti)
   - **Región:** Elige la más cercana a tu ubicación
     - Ejemplo: Si estás en España → `eu-west-1` (Ireland) o `eu-central-1` (Frankfurt)
     - Ejemplo: Si estás en México → `us-east-1` (N. Virginia) o `us-west-2` (Oregon)
   - **IMPORTANTE:** Algunas regiones no tienen tier gratuito, elige una que diga "FREE TIER AVAILABLE"

4. **Nombre del Cluster:**
   - Puedes dejar el nombre por defecto o cambiarlo
   - Ejemplo: `Cluster0` o `healthy-api-cluster`

5. **Haz clic en "Create"**
   - ⏱️ El cluster tarda ~3-5 minutos en crearse

---

### Paso 3: Configurar Usuario de Base de Datos

1. **Mientras se crea el cluster, verás un formulario de usuario:**
   - **Username:** Elige un nombre de usuario (ej: `healthyapi` o `admin`)
   - **Password:** Genera una contraseña segura
     - ⚠️ **IMPORTANTE:** Guarda esta contraseña, la necesitarás después
     - Puedes usar el botón "Autogenerate Secure Password" y copiarla

2. **Haz clic en "Create Database User"**

---

### Paso 4: Configurar Acceso de Red (IP Whitelist)

1. **En la pantalla de "Network Access":**
   - Opción 1: **"Add My Current IP Address"** (recomendado para desarrollo)
     - Esto permite acceso solo desde tu IP actual
   - Opción 2: **"Allow Access from Anywhere"** (0.0.0.0/0)
     - ⚠️ Menos seguro pero útil si tu IP cambia frecuentemente
     - Para desarrollo está bien, para producción usa IP específica

2. **Haz clic en "Finish and Close"**

---

### Paso 5: Obtener Connection String

1. **Una vez creado el cluster, ve a "Database" en el menú lateral**

2. **Haz clic en "Connect" en tu cluster**

3. **Selecciona "Connect your application"**

4. **Copia el Connection String:**
   - Verás algo como:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Reemplaza los placeholders:**
   - `<username>` → Tu nombre de usuario (del Paso 3)
   - `<password>` → Tu contraseña (del Paso 3)
   - Ejemplo final:
   ```
   mongodb+srv://healthyapi:MiPassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

---

### Paso 6: Configurar en tu Proyecto

1. **Abre tu archivo `.env`**

2. **Reemplaza la línea de MONGO_URI:**
   ```env
   # Antes (local):
   # MONGO_URI=mongodb://127.0.0.1:27017

   # Ahora (Atlas):
   MONGO_URI=mongodb+srv://tu-usuario:tu-password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. **Agrega el nombre de tu base de datos:**
   ```env
   DB_NAME=healthyappDB
   ```

4. **Si tu connection string no incluye el nombre de la DB, puedes agregarlo así:**
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/healthyappDB?retryWrites=true&w=majority
   ```

---

### Paso 7: Probar la Conexión

1. **Reinicia tu servidor:**
   ```bash
   npm start
   # o
   node app.js
   ```

2. **Deberías ver en los logs:**
   ```
   ✅ MongoDB conectado exitosamente
   # o similar
   ```

3. **Si hay errores, verifica:**
   - ✅ Usuario y contraseña correctos
   - ✅ IP está en la whitelist
   - ✅ Connection string completo y correcto
   - ✅ Cluster está activo (no pausado)

---

## 🔒 Seguridad Recomendada

### Para Desarrollo:
- ✅ Usa "Add My Current IP Address"
- ✅ Usa contraseña fuerte
- ✅ No compartas tu `.env` en GitHub

### Para Producción:
- ✅ Usa IP específica del servidor (no 0.0.0.0/0)
- ✅ Usa usuario con permisos limitados
- ✅ Habilita autenticación adicional si es posible
- ✅ Usa variables de entorno (nunca hardcodees credenciales)

---

## 📝 Ejemplo Completo de `.env`

```env
# Database Configuration - MongoDB Atlas
MONGO_URI=mongodb+srv://healthyapi:MiPasswordSegura123@cluster0.abc123.mongodb.net/healthyappDB?retryWrites=true&w=majority
DB_NAME=healthyappDB

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:3000

# JWT Secret Key
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI Provider Configuration
AI_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile

# Image Strategy Configuration
IMAGE_STRATEGY=stock

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Authentication failed"

**Causa:** Usuario o contraseña incorrectos

**Solución:**
1. Ve a Atlas → Database Access
2. Verifica el usuario y contraseña
3. Si olvidaste la contraseña, puedes resetearla

---

### Error: "IP not whitelisted"

**Causa:** Tu IP no está en la lista de IPs permitidas

**Solución:**
1. Ve a Atlas → Network Access
2. Haz clic en "Add IP Address"
3. Agrega tu IP actual o usa "Allow Access from Anywhere" (0.0.0.0/0) para desarrollo

---

### Error: "Connection timeout"

**Causa:** Cluster puede estar pausado o hay problemas de red

**Solución:**
1. Ve a Atlas → Database
2. Verifica que el cluster esté activo (no pausado)
3. Si está pausado, haz clic en "Resume"
4. Verifica tu conexión a internet

---

### Error: "Invalid connection string"

**Causa:** Connection string mal formateado

**Solución:**
1. Asegúrate de que el formato sea:
   ```
   mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority
   ```
2. Reemplaza espacios o caracteres especiales en la contraseña con URL encoding
   - Ejemplo: `@` → `%40`, `#` → `%23`

---

## 💡 Tips y Mejores Prácticas

1. **Backups:**
   - El tier gratuito tiene backups limitados
   - Para producción, considera hacer backups manuales periódicos

2. **Monitoreo:**
   - Atlas tiene métricas básicas gratuitas
   - Monitorea el uso de almacenamiento (límite 512 MB)

3. **Escalabilidad:**
   - Si necesitas más espacio, puedes migrar a M2 ($9/mes) o M5 ($57/mes)
   - Los datos se migran automáticamente

4. **Performance:**
   - El tier gratuito es compartido, puede ser más lento que local
   - Para desarrollo está bien, para producción considera un tier de pago

5. **Seguridad:**
   - Nunca subas tu `.env` a GitHub
   - Usa `.gitignore` para excluir `.env`
   - Rota contraseñas periódicamente

---

## 📊 Comparación: Local vs Atlas

| Característica | MongoDB Local | MongoDB Atlas (M0 Free) |
|----------------|---------------|-------------------------|
| **Costo** | $0 | $0 |
| **Almacenamiento** | Ilimitado (tu disco) | 512 MB |
| **Acceso** | Solo local | Desde cualquier lugar |
| **Backups** | Manual | Automáticos (limitados) |
| **Escalabilidad** | Limitada | Fácil escalar |
| **Mantenimiento** | Tú | MongoDB |
| **Performance** | Muy rápido | Bueno (compartido) |

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en MongoDB Atlas
- [ ] Cluster M0 FREE creado
- [ ] Usuario de base de datos creado
- [ ] IP agregada a whitelist
- [ ] Connection string obtenido
- [ ] `.env` actualizado con MONGO_URI
- [ ] Conexión probada exitosamente
- [ ] Datos migrados (si aplica)

---

## 🎯 Próximos Pasos

1. **Migrar datos existentes (si tienes):**
   ```bash
   # Exportar desde local
   mongoexport --uri="mongodb://127.0.0.1:27017/healthyappDB" --collection=recipes --out=recipes.json
   
   # Importar a Atlas
   mongoimport --uri="mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/healthyappDB" --collection=recipes --file=recipes.json
   ```

2. **Verificar conexión:**
   - Reinicia tu servidor
   - Verifica que se conecte correctamente
   - Prueba crear/leer datos

3. **Actualizar documentación:**
   - Actualiza tu README con la nueva configuración
   - Documenta el proceso de migración

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. **Revisa los logs de tu aplicación** para ver el error específico
2. **Verifica la documentación oficial:** https://docs.atlas.mongodb.com/
3. **Comunidad MongoDB:** https://www.mongodb.com/community/forums/

---

¡Listo! Tu base de datos ahora está en la nube y es completamente gratuita 🎉

