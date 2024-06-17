const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports.isAuthenticated = (req, res, next) => {
  //solicito si hay header de autorización
  const authorization = req.header("Authorization"); // "Bearer <token>" || null

  if (!authorization) {
    return next(createError(401, "Authorization header was not provided"));
  }

  const [schema, token] = authorization.split(" "); // "Bearer <token>" --> ["Bearer", "<token>"]

  if (schema !== "Bearer") {
    return next(createError(401, "Authorization schema is not supported"));
  }

  if (!token) {
    return next(createError(401, "A token must be provided"));
  }

  // Me aseguro que tengo schema y tengo token

  const secret = process.env.JWT_SECRET || "test"; //Define la clave secreta que se usará para verificar el token.

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return next(err);
    }

    req.currentUserId = decodedToken.id; //Extrae y guarda el ID del usuario: Si el token es válido, extrae el ID del usuario y lo guarda en req.currentUserId.
    console.log("token dado");
    next();
  });
};

//Este middleware garantiza que solo los usuarios autenticados con un token JWT válido puedan acceder a las rutas protegidas de la aplicación.s
