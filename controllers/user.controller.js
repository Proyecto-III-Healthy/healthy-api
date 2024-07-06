const User = require("./../models/User.model");
const { sendEmail } = require('./../config/nodemailer.config'); // Importar el servicio de email

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
        <p>Gracias por registrarte en nuestra plataforma</p>
        <p>Este es el inicio de un gran cambio</p>
        <a href="${process.env.FRONTEND_URL}/" target="_blank" style="text-decoration: none; color: #007bff;">
        Ir a Healthy App
      </a>
        <img src="https://res.cloudinary.com/dgtbm9skf/image/upload/v1720264276/LogoHealthy_zfzkhx.png" alt="Healthy App Logo" style="max-width: 100%; height: auto; display: block; margin-top: 20px;">

      `;
      
      return sendEmail(userEmail, subject, text, html).then(() =>{
        res.status(204).json(userCreated);

      })
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.currentUserId)
    .then((user) => {
      if (!user) {
        next(createError(402, "User not found"));
      } else {
        res.json(user);
      }
    })
    .catch(next);
};
