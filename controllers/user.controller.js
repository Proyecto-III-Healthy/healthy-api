const User = require("./../models/User.model");
const createError = require("http-errors");
const {
  uploadToCloudinary,
} = require("./../controllers/cloudinary.controller");
const { sendEmail } = require("./../config/nodemailer.config");

module.exports.create = (req, res, next) => {
  const {
    name,
    email,
    password,
    gender,
    weight,
    height,
    objetive,
    ability,
    typeDiet,
    alergic,
  } = req.body;

  User.create({
    name,
    email,
    password,
    gender,
    weight,
    height,
    objetive,
    ability,
    typeDiet,
    alergic,
  })
    .then((userCreated) => {
      const userEmail = email;
      const subject = "¡Healthy App!";
      const text = "¡Gracias por registrarte en Healthy App!";
      const html = `
          <h1>Healthy App te da la bienvenida</h1>
          <p >Gracias por registrarte en nuestra plataforma</p>
          <p>Este es el inicio de un gran cambio</p>
          <a href="${process.env.FRONTEND_URL}/" target="_blank" style="text-decoration: none; color: #83a580; font-weight: bold;">
          Ir a Healthy App
        </a>
          <img src="https://res.cloudinary.com/dgtbm9skf/image/upload/v1720712317/marca_tpzkk0.png" alt="Healthy App" style="width: 300px; height: auto; display: block; margin-top: 30px;">
  
        `;

      return sendEmail(userEmail, subject, text, html).then(() => {
        res.status(204).json(userCreated);
      });
    })

    .catch((err) => {
      if (err.name === "ValidationError") {
        next(createError(400, err.message)); // Bad Request for validation
      } else if (err.code === 11000) {
        next(createError(409, "Email already exists")); // Conflict for duplicate email
      } else {
        next(createError(500, "Internal Server Error")); // General server error
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.currentUserId)
    .then((user) => {
      if (!user) {
        next(createError(404, "User not found"));
      } else {
        res.json(user);
      }
    })
    .catch(next);
};

module.exports.update = (req, res, next) => {
  const updateData = { ...req.body };
  console.log(updateData);

  /* if (req.file) {
    uploadToCloudinary(req.file.path)
      .then((result) => {
        updateData.avatarUrl = result.secure_url;
        return User.findByIdAndUpdate(req.params.id, updateData, { new: true });
      })
      .then((editedUser) => {
        res.json(editedUser);
      })
      .catch(next);
  } else {
    
  }*/
  User.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then((editedUser) => {
      res.json(editedUser);
    })
    .catch(next);
};

module.exports.delete = (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => {
      res.send("User deleted");
    })
    .catch(next);
};

/*module.exports.uploadAvatar = (req, res, next) => {
  if (!req.file) {
    return next(createError(400, "No file uploaded"));
  }

  uploadToCloudinary(req.file.path)
    .then((result) => {
      return User.findByIdAndUpdate(
        req.currentUserId,
        { avatarUrl: result.secure_url },
        { new: true }
      );
    })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch(next);
};*/
