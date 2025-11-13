const recipeService = require("../services/recipe.service");

/**
 * Controlador de Recetas - Refactorizado siguiendo arquitectura limpia
 * 
 * Principios aplicados:
 * - SRP: Solo maneja HTTP
 * - DRY: Reutiliza servicio de recetas
 * - KISS: Código simple y directo
 */
module.exports.listRecipes = async (req, res, next) => {
  try {
    const recipes = await recipeService.getAllRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

module.exports.recipeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await recipeService.getRecipeById(id);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

module.exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await recipeService.toggleFavorite(id);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

module.exports.listFavorites = async (req, res, next) => {
  try {
    const recipes = await recipeService.getFavoriteRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene las recetas generadas por el usuario autenticado
 * 
 * Endpoint: GET /recipes/user/generated
 * Requiere autenticación
 */
module.exports.getUserGeneratedRecipes = async (req, res, next) => {
  try {
    const userId = req.currentUserId;
    const { limit, offset, sort } = req.query;

    const recipes = await recipeService.getGeneratedRecipesByUser(userId, {
      limit,
      offset,
      sort,
    });

    // Asegurar que siempre devolvemos un array (requisito del frontend)
    res.status(200).json(Array.isArray(recipes) ? recipes : []);
  } catch (error) {
    next(error);
  }
};