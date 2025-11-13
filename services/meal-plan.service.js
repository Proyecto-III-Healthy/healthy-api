const DayPlan = require("../models/DayPlan.model");
const Meal = require("../models/Meal.model");
const Recipe = require("../models/Recipe.model");
const User = require("../models/User.model");
const aiService = require("./ai.service");
const imageService = require("./image.service");
const { generateDailyMealPlanPrompt } = require("../templates/prompts.template");
const { normalizeRecipe, normalizeRecipeType } = require("../utils/recipe-normalizer");
const createError = require("http-errors");

/**
 * Meal Plan Service - Lógica de negocio para planes de comida
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de gestión de planes de comida
 * - KISS: Genera un día a la vez (3 comidas) en lugar de toda la semana
 * - DRY: Lógica centralizada y reutilizable
 */
class MealPlanService {
  /**
   * Genera un plan de comidas para un día específico
   * 
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Plan diario creado
   * 
   * Explicación para entrevistas:
   * "Simplifiqué la generación para crear solo un día a la vez (3 comidas).
   * Esto reduce el tamaño del prompt, mejora la calidad de la respuesta,
   * y permite generar la semana día por día si es necesario.
   * Sigue el principio KISS: Keep It Simple, Stupid."
   */
  async generateDailyMealPlan(date, userId, options = {}) {
    // Validar fecha
    if (!this.isValidDate(date)) {
      throw createError(400, "Formato de fecha inválido. Use YYYY-MM-DD");
    }

    // Obtener preferencias del usuario
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "Usuario no encontrado");
    }

    const userPreferences = {
      objetive: user.objetive,
      ability: user.ability,
      typeDiet: user.typeDiet,
      alergic: user.alergic,
    };

    // Verificar si ya existe un plan para esta fecha
    const existingPlan = await DayPlan.findOne({
      user: userId,
      date: new Date(date),
    });

    if (existingPlan && !options.overwrite) {
      throw createError(409, "Ya existe un plan para esta fecha");
    }

    // Generar prompt usando template
    const prompt = generateDailyMealPlanPrompt(userPreferences, date);

    // Generar plan con IA
    const aiResponse = await aiService.generateJSON(prompt);

    // Validar respuesta
    if (!aiResponse.meals || !Array.isArray(aiResponse.meals) || aiResponse.meals.length !== 3) {
      throw createError(500, "La IA no generó un plan válido con 3 comidas");
    }

    // Procesar y guardar el plan
    const dayPlan = await this.saveDailyPlan(aiResponse, userId, date, options);

    return dayPlan;
  }

  /**
   * Guarda un plan diario en la base de datos
   * 
   * @param {Object} aiResponse - Respuesta de la IA
   * @param {string} userId - ID del usuario
   * @param {string} date - Fecha del plan
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Plan guardado
   */
  async saveDailyPlan(aiResponse, userId, date, options = {}) {
    const mealsData = aiResponse.meals;
    const savedMeals = [];

    // Procesar cada comida
    for (const mealData of mealsData) {
      // Generar imagen si está habilitado
      let imageUrl = imageService.getPlaceholderImage();
      
      if (options.generateImages !== false) {
        try {
          imageUrl = await imageService.generateAndUploadImage(
            mealData.recipe.name,
            { fallbackToPlaceholder: true }
          );
        } catch (error) {
          console.error(`Error generando imagen para ${mealData.recipe.name}:`, error);
        }
      }

      // Normalizar y validar receta antes de guardarla
      const normalizedRecipeData = normalizeRecipe({
        ...mealData.recipe,
        urlImage: imageUrl,
      });

      // Agregar userId e isGenerated a la receta
      const recipeData = {
        ...normalizedRecipeData,
        userId: userId,
        isGenerated: true, // Marcar como generada por IA
      };

      // Crear receta
      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      // Normalizar tipo de comida (Meal también tiene enum)
      const normalizedMealType = normalizeRecipeType(mealData.type, "comida");

      // Crear comida
      const meal = new Meal({
        name: mealData.name,
        type: normalizedMealType,
        recipe: savedRecipe._id,
        time: mealData.time,
      });
      const savedMeal = await meal.save();

      savedMeals.push({
        meal: savedMeal._id,
        time: mealData.time,
      });
    }

    // Crear o actualizar plan diario
    const dayPlanData = {
      date: new Date(date),
      meals: savedMeals,
      user: userId,
    };

    let dayPlan;
    if (options.overwrite) {
      dayPlan = await DayPlan.findOneAndUpdate(
        { user: userId, date: new Date(date) },
        dayPlanData,
        { new: true, upsert: true }
      );
    } else {
      dayPlan = new DayPlan(dayPlanData);
      await dayPlan.save();
    }

    // Populate para devolver datos completos
    return DayPlan.findById(dayPlan._id)
      .populate({
        path: "meals.meal",
        populate: { path: "recipe" },
      })
      .populate("user");
  }

  /**
   * Obtiene todos los planes diarios de un usuario
   * 
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>} Array de planes diarios
   */
  async getUserDayPlans(userId, options = {}) {
    const query = { user: userId };

    // Filtrar por rango de fechas si se proporciona
    if (options.startDate) {
      query.date = { $gte: new Date(options.startDate) };
    }
    if (options.endDate) {
      query.date = {
        ...query.date,
        $lte: new Date(options.endDate),
      };
    }

    return DayPlan.find(query)
      .populate({
        path: "meals.meal",
        populate: { path: "recipe" },
      })
      .sort({ date: -1 });
  }

  /**
   * Obtiene un plan diario específico
   * 
   * @param {string} planId - ID del plan
   * @param {string} userId - ID del usuario (para verificación)
   * @returns {Promise<Object>} Plan encontrado
   */
  async getDayPlanById(planId, userId) {
    const plan = await DayPlan.findById(planId)
      .populate({
        path: "meals.meal",
        populate: { path: "recipe" },
      });

    if (!plan) {
      throw createError(404, "Plan no encontrado");
    }

    // Verificar que el plan pertenece al usuario
    if (plan.user.toString() !== userId) {
      throw createError(403, "No tienes permiso para acceder a este plan");
    }

    return plan;
  }

  /**
   * Valida formato de fecha
   * 
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {boolean} True si es válida
   */
  isValidDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
      return false;
    }
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  }
}

module.exports = new MealPlanService();

