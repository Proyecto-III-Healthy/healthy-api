# 🐛 Debug: Error "Invalid URL" con Imágenes

## 🔍 Pasos para Diagnosticar

### 1. Verifica tu `.env`

Asegúrate de que tenga exactamente esto (sin comillas, sin espacios extra):

```env
IMAGE_STRATEGY=stock
UNSPLASH_ACCESS_KEY=tu-access-key-aqui
```

**Importante:** 
- No uses comillas alrededor de los valores
- No dejes espacios antes o después del `=`
- El Access Key debe ser el "Access Key" de Unsplash, NO el "Secret"

### 2. Verifica los Permisos en Unsplash

En la pantalla que estás viendo:
- ✅ **"Acceso público"** debe estar marcado (ya lo está)
- ✅ No necesitas marcar ningún otro permiso
- ✅ Haz clic en "Update application" para guardar

### 3. Verifica el Access Key

Tu Access Key de Unsplash debe:
- Empezar con letras/números (no espacios)
- Tener aproximadamente 40-50 caracteres
- Ser el "Access Key", NO el "Secret"

### 4. Prueba sin Cloudinary primero

Para aislar el problema, prueba **sin Cloudinary**:

En tu `.env`, asegúrate de que Cloudinary NO esté configurado o comenta las líneas:

```env
# Comentar Cloudinary temporalmente para probar
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
```

Esto hará que use URLs directas de Unsplash/Foodish sin intentar subirlas a Cloudinary.

### 5. Revisa los Logs del Servidor

Cuando hagas la petición, revisa la consola del servidor. Deberías ver:

**Si funciona:**
```
✅ Connected to MongoDB: healthyappDB
App running at port 3000 🚀🚀
```

**Si hay error con Unsplash:**
```
Unsplash API error: 401 - Unauthorized
Foodish falló, usando placeholder...
```

**Si hay error con URL:**
```
URL de imagen inválida: ...
Error subiendo imagen de stock a Cloudinary: Invalid URL
```

---

## 🔧 Solución Rápida: Desactivar Cloudinary Temporalmente

Si Cloudinary está causando problemas, puedes desactivarlo temporalmente:

**Opción 1: Comentar Cloudinary en `.env`**
```env
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
```

**Opción 2: Usar solo URLs directas**

El código ya está configurado para usar URLs directas si Cloudinary falla, pero puedes forzarlo modificando el código temporalmente.

---

## 🧪 Prueba Paso a Paso

1. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Haz la petición:**
   ```bash
   POST http://localhost:3000/chat
   Authorization: Bearer TU_TOKEN
   {
     "ingredients": ["pollo", "tomate"]
   }
   ```

3. **Revisa la consola del servidor** y comparte:
   - ¿Qué errores ves?
   - ¿Llega hasta Unsplash?
   - ¿Llega hasta Foodish?
   - ¿Dónde falla exactamente?

---

## 💡 Solución Temporal: Usar Solo Foodish

Si Unsplash sigue dando problemas, puedes usar solo Foodish (funciona sin API key):

En `services/stock-image.service.js`, cambia el orden:

```javascript
// En getRecipeImage(), comenta la parte de Unsplash temporalmente:
// if (this.unsplashAccessKey && this.unsplashAccessKey !== "public") {
//   ...
// }
```

Esto hará que use directamente Foodish, que funciona sin API key.

---

## 📝 Checklist

- [ ] `.env` tiene `IMAGE_STRATEGY=stock` (sin comillas)
- [ ] `.env` tiene `UNSPLASH_ACCESS_KEY=...` (el Access Key correcto)
- [ ] Permisos en Unsplash: "Acceso público" marcado
- [ ] Servidor reiniciado después de cambiar `.env`
- [ ] Cloudinary comentado temporalmente (para aislar el problema)
- [ ] Revisados los logs del servidor

---

¿Qué ves exactamente en la consola del servidor cuando haces la petición? Comparte el error completo para poder ayudarte mejor 🚀

