const recipeService = require("../services/recipe.service");
const emailService = require("../services/email.service");
const User = require("../models/User.model");
const { validateIngredients } = require("../validators/recipe.validator");

/**
 * Controlador de Chat/Recetas - Refactorizado siguiendo arquitectura limpia
 * 
 * Principios aplicados:
 * - SRP: Solo maneja HTTP, delega lógica a servicios
 * - KISS: Código simple y directo
 * - DRY: Reutiliza servicios y validadores
 * 
 * Explicación para entrevistas:
 * "Refactoricé este controlador para que sea 'thin' (delgado).
 * Ahora solo tiene ~30 líneas en lugar de ~175.
 * Toda la lógica de negocio está en los servicios, lo que hace el código
 * más testeable, mantenible y fácil de entender."
 */
module.exports.generateRecipes = async (req, res, next) => {
  try {
    const { ingredients } = req.body;
    const userId = req.currentUserId;

    // Validar entrada
    validateIngredients(ingredients);

    // Generar recetas usando servicio
    const recipes = await recipeService.generateRecipesFromIngredients(
      ingredients,
      userId,
      {
        generateImages: true, // Puede cambiarse a false para reducir costos
      }
    );

    // Obtener email del usuario para enviar
    const user = await User.findById(userId);
    
    // Enviar email de forma asíncrona (no bloquea la respuesta)
    emailService.sendRecipesEmail(user.email, recipes).catch((err) => {
      console.error("Error enviando email:", err);
      // No falla la petición si el email falla
    });

    res.json({ recipes });
  } catch (error) {
    next(error);
  }
};

/**
 * Guarda recetas (mantenido para compatibilidad con rutas existentes)
 * @deprecated Usar generateRecipes que ya guarda las recetas
 */
module.exports.saveRecipes = async (req, res, next) => {
  try {
    const { recipes } = req.body;
    const savedRecipes = await recipeService.saveRecipes(recipes);
    res.json({ recipes: savedRecipes });
  } catch (error) {
    next(error);
  }
};
