const mongoose = require("mongoose");

const DB_NAME = process.env.DB_NAME || "healthyappDB";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

/**
 * Conecta a MongoDB (Atlas o Local)
 * 
 * Soporta dos formatos:
 * - MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname
 * - MongoDB Local: mongodb://127.0.0.1:27017/dbname
 */
const connectDB = () => {
  // Construir connection string correctamente
  let connectionString = MONGO_URI;
  
  // Si la URI no incluye el nombre de la base de datos, agregarlo
  // Manejar casos donde hay query parameters (?appName=...) o no
  if (!MONGO_URI.includes(`/${DB_NAME}`) && !MONGO_URI.includes(`/${DB_NAME}?`)) {
    // Si tiene query parameters, insertar el nombre de DB antes del ?
    if (MONGO_URI.includes('?')) {
      connectionString = MONGO_URI.replace('?', `/${DB_NAME}?`);
    } else {
      // Si no tiene query parameters, agregar el nombre de DB y parámetros recomendados
      connectionString = `${MONGO_URI}/${DB_NAME}?retryWrites=true&w=majority`;
    }
  }

  mongoose
    .connect(connectionString, {
      serverSelectionTimeoutMS: 10000, // Timeout de 10 segundos
      socketTimeoutMS: 45000, // Timeout de socket
    })
    // Nota: useNewUrlParser y useUnifiedTopology fueron removidos porque
    // están deprecados en MongoDB Driver 4.0.0+ y ya no son necesarios
    .then(() => {
      console.log(`✅ Connected to MongoDB: ${DB_NAME}`);
      console.log(`📍 URI: ${MONGO_URI.replace(/\/\/.*@/, "//***:***@")}`); // Oculta credenciales en log
    })
    .catch((err) => {
      console.error(`❌ Error connecting to MongoDB: ${err.message}`);
      console.error(`💡 Tip: Verifica tu MONGO_URI en el archivo .env`);
      process.exit(1); // Sale si no puede conectar
    });
};

connectDB();

process.on("SIGINT", () => {
  mongoose.connection
    .close()
    .then(() => {
      console.log(
        "Mongoose default connection disconnected through app termination"
      );
      process.exit(0);
    })
    .catch((err) =>
      console.log(`Mongoose default connection disconnection error: ${err}`)
    );
});