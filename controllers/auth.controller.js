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
            expiresIn: "1h",
          }
        );
        
        res.json(token);
      });
    })
    .catch(next);
};
