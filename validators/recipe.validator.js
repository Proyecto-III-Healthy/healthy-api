const createError = require("http-errors");

/**
 * Validators para recetas
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de validación
 * - DRY: Validaciones centralizadas y reutilizables
 */

/**
 * Valida que se proporcionen ingredientes
 * 
 * @param {Array} ingredients - Array de ingredientes
 * @throws {Error} Si los ingredientes no son válidos
 */
function validateIngredients(ingredients) {
  if (!ingredients) {
    throw createError(400, "Los ingredientes son requeridos");
  }

  if (!Array.isArray(ingredients)) {
    throw createError(400, "Los ingredientes deben ser un array");
  }

  if (ingredients.length === 0) {
    throw createError(400, "Debe proporcionar al menos un ingrediente");
  }

  // Validar que todos los ingredientes sean strings
  const invalidIngredients = ingredients.filter(
    (ing) => typeof ing !== "string" || ing.trim().length === 0
  );

  if (invalidIngredients.length > 0) {
    throw createError(400, "Todos los ingredientes deben ser strings no vacíos");
  }
}

/**
 * Valida el formato de fecha
 * 
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @throws {Error} Si la fecha no es válida
 */
function validateDate(date) {
  if (!date) {
    throw createError(400, "La fecha es requerida");
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    throw createError(400, "Formato de fecha inválido. Use YYYY-MM-DD");
  }

  const dateObj = new Date(date);
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    throw createError(400, "Fecha inválida");
  }

  // Validar que la fecha no sea en el pasado (opcional)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj < today) {
    throw createError(400, "No se pueden crear planes para fechas pasadas");
  }
}

/**
 * Valida las preferencias del usuario
 * 
 * @param {Object} preferences - Preferencias del usuario
 * @throws {Error} Si las preferencias no son válidas
 */
function validateUserPreferences(preferences) {
  if (!preferences || typeof preferences !== "object") {
    throw createError(400, "Las preferencias del usuario son requeridas");
  }

  // Las preferencias son opcionales, pero si se proporcionan deben ser strings
  const allowedFields = ["objetive", "ability", "typeDiet", "alergic"];
  
  for (const field of allowedFields) {
    if (preferences[field] !== undefined && typeof preferences[field] !== "string") {
      throw createError(400, `El campo ${field} debe ser un string`);
    }
  }
}

module.exports = {
  validateIngredients,
  validateDate,
  validateUserPreferences,
};

