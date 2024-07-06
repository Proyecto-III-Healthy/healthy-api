require("dotenv").config();

const cors = require("cors");

const express = require("express");
const logger = require("morgan");

require("./config/db.config"); // database initial setup

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    // methods: ["GET", "POST"],
    // allowedHeaders: ["Content-Type"],
    // credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const router = require("./router/router");
app.use("/", router);

// Middleware to handle errors.
app.use((err, req, res, next) => {
  res.status(err.status).json(err);
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App running at port ${port} 🚀🚀`));
