const express = require("express");
const logger = require("morgan");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

require("./config/db.config"); // database initial setup

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    // methods: ["GET", "POST"],
    // allowedHeaders: ["Content-Type"],
    // credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public", "uploads")); // Ruta donde se guardarán los archivos subidos
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Middleware para manejar la subida de archivos
app.post("/user/upload-avatar", upload.single("avatar"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Aquí puedes procesar la información de req.file y guardarla en la base de datos o hacer lo necesario
  res.status(200).json({ message: "File uploaded successfully", url: req.file.path });
});

const router = require("./router/router");
app.use("/", router);

// Middleware para manejar errores.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App running at port ${port} 🚀🚀`));
