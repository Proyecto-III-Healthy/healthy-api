# Recomendaciones de APIs de IA Gratuitas

## 🎯 Recomendación Principal: **Groq API**

### ¿Por qué Groq?
- ✅ **100% GRATUITO** con límites generosos (14,400 requests/día)
- ✅ **MUY RÁPIDO** - hasta 10x más rápido que OpenAI
- ✅ Compatible con modelos Llama 3 (70B y 8B)
- ✅ Fácil de integrar (similar a OpenAI)
- ✅ Sin tarjeta de crédito requerida

### Cómo obtener credenciales de Groq:

1. **Regístrate en Groq:**
   - Ve a: https://console.groq.com/
   - Crea una cuenta (puedes usar GitHub o Google)

2. **Obtén tu API Key:**
   - Una vez dentro del dashboard, ve a "API Keys"
   - Haz clic en "Create API Key"
   - Copia la clave (empieza con `gsk_...`)

3. **Configuración en tu proyecto:**
   - Agrega a tu `.env`:
   ```
   GROQ_API_KEY=tu-api-key-aqui
   ```

4. **Cambios en el código:**
   - Cambiar la URL de `https://api.openai.com/v1/chat/completions` a `https://api.groq.com/openai/v1/chat/completions`
   - Cambiar el modelo a `llama-3.3-70b-versatile` (recomendado) o `llama-3.1-8b-instant` (más rápido)
   - Usar `GROQ_API_KEY` en lugar de `OPENAI_API_KEY`
   
   **Nota:** El modelo `llama-3.1-70b-versatile` fue descontinuado en enero 2025. Usa `llama-3.3-70b-versatile` como reemplazo.

---

## 🔄 Alternativa: **Google Gemini API**

### Ventajas:
- ✅ Tier gratuito muy generoso (60 requests/minuto)
- ✅ Modelo muy potente (Gemini Pro)
- ✅ Bueno para generación de texto estructurado

### Cómo obtener credenciales:

1. **Ve a Google AI Studio:**
   - https://aistudio.google.com/app/apikey

2. **Crea una API Key:**
   - Haz clic en "Get API Key"
   - Selecciona o crea un proyecto de Google Cloud
   - Copia la API Key

3. **Configuración:**
   ```
   GEMINI_API_KEY=tu-api-key-aqui
   ```

**Nota:** La API de Gemini tiene un formato diferente, necesitarías adaptar el código.

---

## 🆓 Alternativa: **Hugging Face Inference API**

### Ventajas:
- ✅ Gratis con límites razonables
- ✅ Muchos modelos disponibles
- ✅ No requiere tarjeta de crédito

### Cómo obtener credenciales:

1. **Regístrate en Hugging Face:**
   - https://huggingface.co/join

2. **Obtén tu token:**
   - Ve a Settings > Access Tokens
   - Crea un nuevo token con permisos de lectura
   - Copia el token

3. **Configuración:**
   ```
   HUGGINGFACE_API_KEY=tu-token-aqui
   ```

---

## 📊 Comparación Rápida

| API | Gratis | Velocidad | Facilidad | Recomendación |
|-----|--------|-----------|-----------|---------------|
| **Groq** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ **MEJOR OPCIÓN** |
| Gemini | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Buena alternativa |
| Hugging Face | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Más complejo |
| OpenAI | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Solo si tienes créditos |

---

## 🚀 Implementación Recomendada: Groq

Te recomiendo usar **Groq** porque:
1. Es completamente gratuito
2. Es muy rápido
3. La integración es casi idéntica a OpenAI (solo cambias la URL y el modelo)
4. Los modelos Llama 3 son excelentes para generar JSON estructurado

¿Quieres que te ayude a adaptar el código para usar Groq?

