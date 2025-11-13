# 🔧 Solución: Error "Invalid URL"

## ❌ Problema

Error `Invalid URL` al hacer POST a `/chat` con `IMAGE_STRATEGY=stock`.

## ✅ Solución Aplicada

He corregido el código para que funcione **sin necesidad de API keys**:

### Cambios realizados:

1. **Unsplash ahora es opcional:**
   - Solo se usa si tienes `UNSPLASH_ACCESS_KEY` configurado
   - Si no tienes key, salta directamente a Foodish

2. **Foodish como principal (sin API key):**
   - Funciona sin configuración
   - Imágenes aleatorias de comida de alta calidad
   - Muy rápido y confiable

3. **Cloudinary opcional:**
   - Solo sube a Cloudinary si está configurado
   - Si no está configurado, usa URLs directas de las APIs

---

## 🚀 Configuración Actual

### Opción 1: Sin configuración (Funciona ahora)

**No necesitas hacer nada.** El sistema funciona automáticamente con:
- Foodish API (sin API key requerida)
- Placeholder mejorado como fallback

**Tu `.env` solo necesita:**
```env
IMAGE_STRATEGY=stock
```

### Opción 2: Con Unsplash API Key (Opcional - mejor calidad)

Si quieres imágenes más relevantes por nombre de receta:

1. **Obtén API Key de Unsplash:**
   - Ve a: https://unsplash.com/developers
   - Crea cuenta y aplicación
   - Copia tu "Access Key"

2. **Agrega a `.env`:**
   ```env
   IMAGE_STRATEGY=stock
   UNSPLASH_ACCESS_KEY=tu-access-key-aqui
   ```

---

## 🧪 Prueba Ahora

1. **Asegúrate de tener en `.env`:**
   ```env
   IMAGE_STRATEGY=stock
   ```

2. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

3. **Prueba el endpoint:**
   ```bash
   POST http://localhost:3000/chat
   {
     "ingredients": ["pollo", "tomate", "cebolla"]
   }
   ```

**Deberías ver:**
- ✅ Sin errores "Invalid URL"
- ✅ Imágenes de Foodish (aleatorias de comida)
- ✅ Respuesta rápida (~2-5 segundos)

---

## 📊 Estrategia de Fallback Actual

1. **Unsplash** (solo si tienes API key)
   - Búsqueda específica por nombre de receta
   - Alta calidad y relevancia

2. **Foodish** (principal sin API key)
   - Imágenes aleatorias de comida
   - Funciona sin configuración
   - Alta calidad

3. **Placeholder mejorado** (último recurso)
   - Imagen genérica de comida de Unsplash Source
   - Siempre disponible

---

## 🔍 Si Aún Tienes Problemas

### Verifica en la consola del servidor:

Deberías ver logs como:
```
Foodish API no disponible, usando placeholder
```
o
```
Unsplash falló para "Pollo al ajillo", intentando siguiente fuente...
```

### Verifica tu `.env`:

```env
# Debe estar así (sin comillas)
IMAGE_STRATEGY=stock

# Opcional (solo si quieres Unsplash)
UNSPLASH_ACCESS_KEY=tu-key-aqui
```

### Verifica que el servidor esté corriendo:

```bash
# Deberías ver:
✅ Connected to MongoDB: healthyappDB
App running at port 3000 🚀🚀
```

---

## 💡 Notas

- **Foodish funciona sin API key** - Es la mejor opción para empezar
- **Cloudinary es opcional** - Si no está configurado, usa URLs directas
- **Siempre hay fallback** - Nunca deberías ver "Invalid URL" ahora

---

¿Funciona ahora? Si aún tienes problemas, comparte el error exacto de la consola del servidor 🚀

