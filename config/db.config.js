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
  // Si la URI ya incluye el nombre de la base de datos, úsala directamente
  // Si no, concaténala
  const connectionString = MONGO_URI.includes(DB_NAME)
    ? MONGO_URI
    : `${MONGO_URI}/${DB_NAME}`;

  mongoose
    .connect(connectionString)
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