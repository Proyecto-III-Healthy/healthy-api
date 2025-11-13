# 🧪 Guía de Pruebas - Healthy API

## ✅ Paso 1: Verificar que MongoDB esté corriendo

### Windows:
```powershell
# Verificar que MongoDB esté corriendo
mongosh
# O si tienes la versión antigua:
mongo
```

Si te conecta correctamente, verás algo como:
```
Current Mongosh log ID: ...
Connecting to: mongodb://127.0.0.1:27017
```

### Si MongoDB no está corriendo:
1. Abre "Services" (Servicios) en Windows
2. Busca "MongoDB"
3. Haz clic derecho → "Start"

---

## ✅ Paso 2: Verificar tu archivo .env

Asegúrate de tener estas variables mínimas en tu `.env`:

```env
# Database (Local)
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=healthyappDB

# Server
PORT=3000
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=tu-clave-secreta-aqui

# AI Provider (opcional para pruebas básicas)
AI_PROVIDER=groq
GROQ_API_KEY=tu-api-key-aqui
```

**Nota:** Para pruebas básicas de conexión y endpoints sin IA, puedes omitir las variables de IA temporalmente.

---

## ✅ Paso 3: Instalar dependencias (si no lo has hecho)

```bash
npm install
```

---

## ✅ Paso 4: Iniciar el servidor

```bash
npm run dev
```

Deberías ver:
```
✅ Connected to MongoDB: healthyappDB
📍 URI: mongodb://***:***@...
App running at port 3000 🚀🚀
```

Si ves errores, revisa:
- Que MongoDB esté corriendo
- Que el `.env` esté correctamente configurado
- Que el puerto 3000 no esté ocupado

---

## 🧪 Paso 5: Probar los Endpoints

### Opción A: Usando cURL (Terminal/PowerShell)

### Opción B: Usando Postman (Recomendado - más fácil)

### Opción C: Usando Thunder Client (Extensión de VS Code)

---

## 📋 Endpoints Disponibles

### 1. **Registro de Usuario** ✅ (No requiere autenticación)

**POST** `http://localhost:3000/register`

**Body (JSON):**
```json
{
  "name": "Diego",
  "email": "diego@test.com",
  "password": "12345678",
  "gender": "masculino",
  "weight": 75,
  "height": 175,
  "objetive": "perder peso",
  "ability": "principiante",
  "typeDiet": "vegetariana",
  "alergic": "ninguna"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Diego\",\"email\":\"diego@test.com\",\"password\":\"12345678\",\"objetive\":\"perder peso\",\"ability\":\"principiante\",\"typeDiet\":\"vegetariana\",\"alergic\":\"ninguna\"}"
```

**Respuesta esperada:**
- Status: `204` o `200`
- Cuerpo: Usuario creado o vacío

---

### 2. **Login** ✅ (Obtener token)

**POST** `http://localhost:3000/login`

**Body (JSON):**
```json
{
  "email": "diego@test.com",
  "password": "12345678"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"diego@test.com\",\"password\":\"12345678\"}"
```

**Respuesta esperada:**
```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**⚠️ IMPORTANTE:** Copia este token, lo necesitarás para los siguientes endpoints.

---

### 3. **Obtener Usuario Actual** 🔒 (Requiere autenticación)

**GET** `http://localhost:3000/users/me`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**cURL:**
```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
{
  "_id": "...",
  "name": "Diego",
  "email": "diego@test.com",
  ...
}
```

---

### 4. **Listar Recetas** ✅ (No requiere autenticación)

**GET** `http://localhost:3000/recipes`

**cURL:**
```bash
curl -X GET http://localhost:3000/recipes
```

**Respuesta esperada:**
```json
[]
```
(Array vacío si no hay recetas aún)

---

### 5. **Generar Recetas con IA** 🔒 (Requiere autenticación + API Key de IA)

**POST** `http://localhost:3000/chat`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "ingredients": ["pollo", "tomate", "cebolla", "ajo"]
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d "{\"ingredients\":[\"pollo\",\"tomate\",\"cebolla\",\"ajo\"]}"
```

**Respuesta esperada:**
```json
{
  "recipes": [
    {
      "_id": "...",
      "name": "Pollo al ajillo",
      "ingredients": [...],
      "steps": [...],
      ...
    },
    ...
  ]
}
```

**⚠️ Nota:** Este endpoint requiere:
- Token de autenticación válido
- API Key de Groq o OpenAI configurada en `.env`
- Puede tardar 30-60 segundos (genera imágenes con IA)

---

### 6. **Generar Plan Diario de Comidas** 🔒 (Requiere autenticación + API Key de IA)

**POST** `http://localhost:3000/dayPlan`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "startDate": "2024-12-20",
  "userPreferences": {
    "objetive": "perder peso",
    "ability": "principiante",
    "typeDiet": "vegetariana",
    "alergic": "ninguna"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/dayPlan \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d "{\"startDate\":\"2024-12-20\",\"userPreferences\":{\"objetive\":\"perder peso\",\"ability\":\"principiante\",\"typeDiet\":\"vegetariana\",\"alergic\":\"ninguna\"}}"
```

**Respuesta esperada:**
```json
{
  "dailyMealPlan": {
    "_id": "...",
    "date": "2024-12-20T00:00:00.000Z",
    "meals": [
      {
        "meal": {
          "recipe": {
            "name": "Desayuno saludable",
            ...
          }
        }
      },
      ...
    ]
  }
}
```

**⚠️ Nota:** Este endpoint requiere API Key de IA y puede tardar 1-2 minutos.

---

### 7. **Obtener Planes del Usuario** 🔒 (Requiere autenticación)

**GET** `http://localhost:3000/userDayPlans`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**cURL:**
```bash
curl -X GET http://localhost:3000/userDayPlans \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🎯 Orden Recomendado de Pruebas

1. ✅ **Registro** → Crea un usuario
2. ✅ **Login** → Obtén el token
3. ✅ **Obtener Usuario** → Verifica autenticación
4. ✅ **Listar Recetas** → Verifica que funciona (debe estar vacío)
5. 🔒 **Generar Recetas** → Prueba con IA (requiere API Key)
6. 🔒 **Generar Plan Diario** → Prueba generación de planes (requiere API Key)
7. 🔒 **Obtener Planes** → Verifica que se guardaron

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"
- Verifica que MongoDB esté corriendo: `mongosh`
- Verifica que `MONGO_URI` en `.env` sea correcto

### Error: "401 Unauthorized"
- Verifica que el token sea válido
- Asegúrate de incluir `Bearer ` antes del token
- Haz login nuevamente para obtener un token fresco

### Error: "API Key no configurada"
- Para endpoints de IA, necesitas configurar `GROQ_API_KEY` o `OPENAI_API_KEY` en `.env`
- Si solo quieres probar endpoints básicos, evita los endpoints de IA

### Error: "Port 3000 already in use"
- Cambia el puerto en `.env`: `PORT=3001`
- O cierra la aplicación que está usando el puerto 3000

---

## 📝 Archivo de Pruebas Rápido

Crea un archivo `test-api.http` (o usa Postman) con estos ejemplos:

```http
### 1. Registro
POST http://localhost:3000/register
Content-Type: application/json

{
  "name": "Diego",
  "email": "diego@test.com",
  "password": "12345678",
  "objetive": "perder peso",
  "ability": "principiante",
  "typeDiet": "vegetariana",
  "alergic": "ninguna"
}

### 2. Login
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "diego@test.com",
  "password": "12345678"
}

### 3. Obtener Usuario (reemplaza TOKEN con el token del login)
GET http://localhost:3000/users/me
Authorization: Bearer TOKEN

### 4. Listar Recetas
GET http://localhost:3000/recipes

### 5. Generar Recetas (reemplaza TOKEN)
POST http://localhost:3000/chat
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "ingredients": ["pollo", "tomate", "cebolla"]
}
```

---

## ✅ Checklist de Pruebas

- [ ] MongoDB está corriendo
- [ ] `.env` está configurado correctamente
- [ ] Servidor inicia sin errores
- [ ] Puedo registrar un usuario
- [ ] Puedo hacer login y obtener token
- [ ] Puedo obtener mi usuario con el token
- [ ] Puedo listar recetas (aunque esté vacío)
- [ ] Puedo generar recetas con IA (si tengo API Key)
- [ ] Puedo generar plan diario (si tengo API Key)
- [ ] Puedo obtener mis planes guardados

---

¡Listo para probar! 🚀

