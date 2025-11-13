const Recipe = require("../models/Recipe.model");
const User = require("../models/User.model");
const aiService = require("./ai.service");
const imageService = require("./image.service");
const { generateRecipesPrompt } = require("../templates/prompts.template");
const { normalizeRecipes } = require("../utils/recipe-normalizer");
const createError = require("http-errors");

/**
 * Recipe Service - Lógica de negocio para recetas
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de gestión de recetas
 * - DRY: Lógica centralizada y reutilizable
 * - KISS: Métodos simples y claros
 */
class RecipeService {
  /**
   * Genera recetas usando IA basadas en ingredientes y preferencias del usuario
   * 
   * @param {Array<string>} ingredients - Lista de ingredientes
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones adicionales (generateImages, etc.)
   * @returns {Promise<Array>} Array de recetas generadas
   * 
   * Explicación para entrevistas:
   * "Este método encapsula toda la lógica de generación de recetas:
   * 1. Obtiene preferencias del usuario
   * 2. Genera prompt usando template
   * 3. Llama a IA para generar recetas
   * 4. Opcionalmente genera imágenes
   * 5. Guarda en base de datos
   * 
   * Los controladores solo llaman a este método y manejan la respuesta HTTP.
   * Esto separa completamente la lógica de negocio de la capa de presentación."
   */
  async generateRecipesFromIngredients(ingredients, userId, options = {}) {
    // Validación de entrada
    if (!ingredients || ingredients.length === 0) {
      throw createError(400, "Se requieren ingredientes para generar recetas");
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

    // Generar prompt usando template
    const prompt = generateRecipesPrompt(ingredients, userPreferences);

    // Generar recetas con IA
    const aiResponse = await aiService.generateJSON(prompt);
    
    // Validar respuesta de IA
    if (!aiResponse.recetas || !Array.isArray(aiResponse.recetas)) {
      throw createError(500, "Formato de respuesta de IA inválido");
    }

    // Normalizar y validar recetas antes de procesarlas
    // Esto asegura que los valores del enum sean correctos y maneja variaciones de la IA
    let recipes;
    try {
      recipes = normalizeRecipes(aiResponse.recetas);
    } catch (error) {
      console.error("Error normalizando recetas:", error);
      throw createError(500, `Error procesando recetas: ${error.message}`);
    }

    // Generar imágenes si está habilitado
    if (options.generateImages !== false) {
      recipes = await this.addImagesToRecipes(recipes, options);
    } else {
      // Usar placeholders si no se generan imágenes
      recipes = recipes.map((recipe) => ({
        ...recipe,
        urlImage: imageService.getPlaceholderImage(),
      }));
    }

    // Guardar recetas en base de datos
    const savedRecipes = await Recipe.insertMany(recipes);

    return savedRecipes;
  }

  /**
   * Agrega imágenes a las recetas generadas
   * 
   * @param {Array} recipes - Array de recetas sin imágenes
   * @param {Object} options - Opciones para generación de imágenes
   * @returns {Promise<Array>} Recetas con URLs de imágenes
   */
  async addImagesToRecipes(recipes, options = {}) {
    try {
      const imageUrls = await imageService.generateMultipleImages(recipes, {
        skipGeneration: options.skipImageGeneration || false,
        delayBetweenRequests: options.imageDelay || 1000,
      });

      return recipes.map((recipe, index) => ({
        ...recipe,
        urlImage: imageUrls[index],
      }));
    } catch (error) {
      console.error("Error generando imágenes, usando placeholders:", error);
      // Fallback a placeholders si falla la generación
      return recipes.map((recipe) => ({
        ...recipe,
        urlImage: imageService.getPlaceholderImage(),
      }));
    }
  }

  /**
   * Obtiene todas las recetas
   * 
   * @returns {Promise<Array>} Array de recetas
   */
  async getAllRecipes() {
    return Recipe.find().sort({ createdAt: -1 });
  }

  /**
   * Obtiene una receta por ID
   * 
   * @param {string} recipeId - ID de la receta
   * @returns {Promise<Object>} Receta encontrada
   */
  async getRecipeById(recipeId) {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw createError(404, "Receta no encontrada");
    }
    return recipe;
  }

  /**
   * Obtiene todas las recetas favoritas
   * 
   * @returns {Promise<Array>} Array de recetas favoritas
   */
  async getFavoriteRecipes() {
    return Recipe.find({ isFavorite: true }).sort({ createdAt: -1 });
  }

  /**
   * Alterna el estado de favorito de una receta
   * 
   * @param {string} recipeId - ID de la receta
   * @returns {Promise<Object>} Receta actualizada
   */
  async toggleFavorite(recipeId) {
    const recipe = await this.getRecipeById(recipeId);
    recipe.isFavorite = !recipe.isFavorite;
    await recipe.save();
    return recipe;
  }

  /**
   * Guarda múltiples recetas en la base de datos
   * 
   * @param {Array} recipes - Array de recetas a guardar
   * @returns {Promise<Array>} Recetas guardadas
   */
  async saveRecipes(recipes) {
    if (!recipes || recipes.length === 0) {
      throw createError(400, "No hay recetas para guardar");
    }
    return Recipe.insertMany(recipes);
  }
}

module.exports = new RecipeService();

