const { sendEmail } = require("../config/nodemailer.config");

/**
 * Email Service - Maneja el envío de emails
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de envío de emails
 * - DRY: Templates centralizados
 */
class EmailService {
  /**
   * Envía un email con las recetas generadas
   * 
   * @param {string} userEmail - Email del usuario
   * @param {Array} recipes - Array de recetas
   * @returns {Promise<void>}
   */
  async sendRecipesEmail(userEmail, recipes) {
    const subject = "Tus recetas solicitadas";
    const text = "Aquí tienes las recetas que solicitaste:";
    const html = this.generateRecipesEmailHTML(recipes);

    return sendEmail(userEmail, subject, text, html);
  }

  /**
   * Genera el HTML del email con las recetas
   * 
   * @param {Array} recipes - Array de recetas
   * @returns {string} HTML formateado
   */
  generateRecipesEmailHTML(recipes) {
    const recipesHTML = recipes
      .map(
        (recipe) => `
      <div style="max-width: 540px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 30px;">
        <div style="display: flex;">
          <div style="flex: 1;">
            <img
              src="${recipe.urlImage}"
              style="width: 100%; height: auto; border-radius: 8px 0 0 8px;"
              alt="${recipe.name}"
            />
          </div>
          <div style="flex: 2; padding: 16px;">
            <div>
              <h5 style="margin: 0; font-size: 1.25rem;">${recipe.name}</h5>
              <p style="margin: 8px 0;">${recipe.phrase}</p>
              <p style="margin: 8px 0;">
                <small>${recipe.preparationTime} min</small>
              </p>
              <a href="${process.env.FRONTEND_URL}/recipes/${recipe._id}" target="_blank" style="color: #83a580; text-decoration: none;">Ver detalles</a>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    return `
      <h1>Tus recetas solicitadas</h1>
      ${recipesHTML}
      <div style="width: 100%; margin: 20px auto; text-align: center;">
        <img
          src="https://res.cloudinary.com/dgtbm9skf/image/upload/v1720713077/Logo-Healthy_1_aqzchm.png"
          style="width: 150px; height: auto;"
          alt="Healthy App"
        />
      </div>
    `;
  }
}

module.exports = new EmailService();

