const nodemailer = require('nodemailer');

// Configura el transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambia según el proveedor de tu servicio de correo
  auth: {
    user: process.env.EMAIL_USER, // Tu email
    pass: process.env.EMAIL_PASS  // Tu contraseña o token de aplicación
  }
});

// Función para enviar correos electrónicos
const sendEmail = (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
