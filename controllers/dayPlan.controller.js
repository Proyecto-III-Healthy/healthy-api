const mealPlanService = require("../services/meal-plan.service");
const { validateDate, validateUserPreferences } = require("../validators/recipe.validator");

/**
 * Controlador de Planes de Comida - Refactorizado siguiendo arquitectura limpia
 * 
 * Principios aplicados:
 * - SRP: Solo maneja HTTP
 * - DRY: Reutiliza servicio de planes
 * - KISS: Código simple y directo
 * 
 * Explicación para entrevistas:
 * "Este controlador ahora tiene solo ~25 líneas en lugar de ~140.
 * Toda la complejidad de generación de planes está en el servicio,
 * haciendo el código mucho más mantenible y testeable."
 */
module.exports.generateDailyMealPlan = async (req, res, next) => {
  try {
    const { startDate, userPreferences, overwrite } = req.body;
    const userId = req.currentUserId;

    // Validar entrada
    validateDate(startDate);
    if (userPreferences) {
      validateUserPreferences(userPreferences);
    }

    // Generar plan usando servicio
    const dailyMealPlan = await mealPlanService.generateDailyMealPlan(
      startDate,
      userId,
      {
        overwrite: overwrite || false,
        generateImages: true, // Puede cambiarse a false para reducir costos
      }
    );

    res.json({ dailyMealPlan });
  } catch (error) {
    next(error);
  }
};

module.exports.getUserDayPlans = async (req, res, next) => {
  try {
    const userId = req.currentUserId;
    const { startDate, endDate } = req.query;

    const dayPlans = await mealPlanService.getUserDayPlans(userId, {
      startDate,
      endDate,
    });

    res.json(dayPlans);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un plan diario específico por ID
 * 
 * @param {Object} req - Request object
 * @param {string} req.params.id - ID del plan diario
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
module.exports.getDayPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.currentUserId;

    const dayPlan = await mealPlanService.getDayPlanById(id, userId);

    res.json({ dayPlan });
  } catch (error) {
    next(error);
  }
};