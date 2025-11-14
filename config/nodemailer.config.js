const nodemailer = require('nodemailer');

// Configura el transporte de nodemailer con timeouts más largos
const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambia según el proveedor de tu servicio de correo
  auth: {
    user: process.env.EMAIL_USER, // Tu email
    pass: process.env.EMAIL_PASS  // Tu contraseña o token de aplicación
  },
  // Configuración para evitar timeouts en Render
  connectionTimeout: 10000, // 10 segundos para establecer conexión
  socketTimeout: 10000, // 10 segundos para operaciones de socket
  greetingTimeout: 10000, // 10 segundos para saludo SMTP
  // Retry configuration
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
});

// Verificar configuración al iniciar
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️ Configuración de email no válida:', error.message);
      console.warn('💡 El registro funcionará pero los emails no se enviarán');
    } else {
      console.log('✅ Configuración de email verificada correctamente');
    }
  });
} else {
  console.warn('⚠️ EMAIL_USER o EMAIL_PASS no configurados. Los emails no se enviarán.');
}

// Función para enviar correos electrónicos
const sendEmail = (to, subject, text, html) => {
  // Si no hay configuración de email, retornar promesa resuelta
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`⚠️ Intento de enviar email a ${to} pero EMAIL_USER/EMAIL_PASS no están configurados`);
    return Promise.resolve();
  }

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
