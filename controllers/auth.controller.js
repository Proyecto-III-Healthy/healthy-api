const User = require("../models/User.model");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

// { "email": "carlos@email.com", "password": "12345678" }

module.exports.login = (req, res, next) => {
  const loginError = createError(401, "Email or password incorrect");

  const { email, password } = req.body;

  if (!email || !password) {
    return next(loginError);
  }

  // Check email
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return next(loginError);
      }

      // Check password
      return user.checkPassword(password).then((match) => {
        if (!match) {
          console.log("ENTRO CON ERROR");
          return next(loginError);
        }

        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET || "test",
          {
            expiresIn: "3h",
          }
        );
        
        res.json(token);
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(createError(400, err.message)); // Bad Request for validation errors
      } else if (err.code === 11000) {
        next(createError(409, "Email already exists")); // Conflict for duplicate email
      } else {
        next(createError(500, "Internal Server Error")); // General server error
      }
    });
};
