# 🔧 Solución de Errores Comunes

## ❌ Error: `EADDRINUSE: address already in use :::3000`

### ¿Qué significa?
El puerto 3000 ya está siendo usado por otro proceso (probablemente otra instancia de tu servidor).

### Soluciones:

#### Opción 1: Cerrar el proceso que usa el puerto (Recomendado)

**Windows (PowerShell):**
```powershell
# 1. Encontrar el proceso que usa el puerto 3000
netstat -ano | findstr :3000

# Verás algo como:
# TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
# El último número (12345) es el PID del proceso

# 2. Cerrar el proceso
taskkill /PID 12345 /F

# O en una sola línea:
netstat -ano | findstr :3000 | ForEach-Object { $_.Split()[-1] } | ForEach-Object { taskkill /PID $_ /F }
```

**Windows (CMD):**
```cmd
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

**Mac/Linux:**
```bash
# Encontrar y cerrar el proceso
lsof -ti:3000 | xargs kill -9

# O paso a paso:
lsof -i:3000          # Ver qué proceso usa el puerto
kill -9 [PID_NUMBER]  # Cerrar el proceso
```

#### Opción 2: Cambiar el puerto en tu aplicación

1. **Edita tu archivo `.env`:**
```env
PORT=3001
```

2. **O cambia directamente en `app.js`:**
```javascript
const port = process.env.PORT || 3001; // Cambiado de 3000 a 3001
```

#### Opción 3: Usar un script para matar procesos automáticamente

Crea un archivo `kill-port.js`:
```javascript
const { exec } = require('child_process');

const port = process.argv[2] || 3000;

exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        exec(`taskkill /PID ${pid} /F`, (err) => {
          if (!err) console.log(`✅ Proceso ${pid} cerrado`);
        });
      }
    });
  } else {
    console.log(`✅ Puerto ${port} está libre`);
  }
});
```

Uso: `node kill-port.js 3000`

---

## ⚠️ Warnings de MongoDB (Ya corregidos)

### Problema:
```
[MONGODB DRIVER] Warning: useNewUrlParser is a deprecated option
[MONGODB DRIVER] Warning: useUnifiedTopology is a deprecated option
```

### Solución:
Ya fueron removidas las opciones deprecadas en `config/db.config.js`. Estas opciones ya no son necesarias en MongoDB Driver 4.0.0+.

---

## 🔍 Verificar que el puerto está libre

**Windows:**
```powershell
netstat -ano | findstr :3000
```

Si no muestra nada, el puerto está libre ✅

**Mac/Linux:**
```bash
lsof -i:3000
```

Si no muestra nada, el puerto está libre ✅

---

## 💡 Prevención

Para evitar este problema en el futuro:

1. **Siempre cierra el servidor correctamente:**
   - Presiona `Ctrl+C` en la terminal donde corre el servidor
   - Espera a que se cierre completamente antes de iniciarlo de nuevo

2. **Verifica antes de iniciar:**
   ```powershell
   # Windows
   netstat -ano | findstr :3000
   
   # Si muestra algo, cierra ese proceso primero
   ```

3. **Usa diferentes puertos para diferentes proyectos:**
   - Proyecto 1: puerto 3000
   - Proyecto 2: puerto 3001
   - etc.

---

## 🚀 Después de solucionar

Una vez que hayas cerrado el proceso o cambiado el puerto:

1. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Deberías ver:**
   ```
   ✅ Connected to MongoDB: healthyappDB
   App running at port 3000 🚀🚀
   ```

---

¿Necesitas ayuda con algún otro error? 🛠️

