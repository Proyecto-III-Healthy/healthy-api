const Recipe = require("../models/Recipe.model");
const User = require("../models/User.model");
const aiService = require("./ai.service");
const imageService = require("./image.service");
const stockImageService = require("./stock-image.service");
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

    // Determinar estrategia de imágenes
    // Por defecto usa "stock" que es rápido y confiable
    const imageStrategy = options.imageStrategy || process.env.IMAGE_STRATEGY || "stock";
    
    // Flujo SÍNCRONO para stock images (rápido, ~2-5 seg, siempre funciona)
    // Stock images se genera antes de guardar para tener URLs inmediatas
    if (options.generateImages !== false && imageStrategy === "stock") {
      recipes = await this.addImagesToRecipes(recipes, {
        ...options,
        ingredients: ingredients,
      });

      // Agregar userId a cada receta antes de guardar
      const recipesWithUserId = recipes.map((recipe) => ({
        ...recipe,
        userId: userId,
        isGenerated: true,
        imageStatus: "completed", // Stock images se completan inmediatamente
      }));

      // Guardar recetas con imágenes ya incluidas
      const savedRecipes = await Recipe.insertMany(recipesWithUserId);
      return savedRecipes;
    }

    // Flujo ASÍNCRONO solo para generación con IA (lenta, requiere créditos)
    // Solo se usa si explícitamente se solicita IA
    if (options.generateImages !== false && (imageStrategy === "ai" || imageStrategy === "free-ai" || imageStrategy === "dalle")) {
      // Guardar recetas con placeholder primero (respuesta rápida)
      const recipesWithPlaceholder = recipes.map((recipe) => ({
        ...recipe,
        urlImage: stockImageService.getImprovedPlaceholder(recipe.name),
        userId: userId,
        isGenerated: true,
        imageStatus: "pending", // Marcar como pendiente de generación
      }));

      const savedRecipes = await Recipe.insertMany(recipesWithPlaceholder);

      // Generar imágenes en background (no bloquea la respuesta)
      this.generateImagesInBackground(savedRecipes, ingredients, options)
        .catch((err) => {
          console.error("Error generando imágenes en background:", err);
          // No falla la petición si el background falla
        });

      return savedRecipes;
    }

    // Flujo SÍNCRONO para "hybrid" (intenta stock primero, luego IA en background si falla)
    if (options.generateImages !== false && imageStrategy === "hybrid") {
      // Intentar stock images primero (rápido y confiable)
      recipes = await this.addImagesToRecipes(recipes, {
        ...options,
        ingredients: ingredients,
      });

      // Guardar recetas con stock images
      const recipesWithUserId = recipes.map((recipe) => ({
        ...recipe,
        userId: userId,
        isGenerated: true,
        imageStatus: "completed",
      }));

      const savedRecipes = await Recipe.insertMany(recipesWithUserId);

      // Opcionalmente intentar mejorar con IA en background (solo si está configurado)
      // Esto es opcional y no bloquea la respuesta
      if (process.env.REPLICATE_API_TOKEN || process.env.OPENAI_API_KEY) {
        this.generateImagesInBackground(savedRecipes, ingredients, {
          ...options,
          imageStrategy: "free-ai", // Intentar mejorar con IA
        }).catch((err) => {
          console.log("Intentando mejorar imágenes con IA en background (opcional)");
        });
      }

      return savedRecipes;
    }

    // Si no se generan imágenes, usar placeholders mejorados
    if (options.generateImages === false) {
      recipes = recipes.map((recipe) => ({
        ...recipe,
        urlImage: stockImageService.getImprovedPlaceholder(recipe.name),
      }));
    }

    // Agregar userId a cada receta antes de guardar
    const recipesWithUserId = recipes.map((recipe) => ({
      ...recipe,
      userId: userId,
      isGenerated: true,
      imageStatus: "completed",
    }));

    // Guardar recetas en base de datos
    const savedRecipes = await Recipe.insertMany(recipesWithUserId);

    return savedRecipes;
  }

  /**
   * Genera imágenes en background para recetas ya guardadas
   * 
   * Este método se ejecuta de forma asíncrona después de guardar las recetas.
   * No bloquea la respuesta al usuario. Procesa cada imagen con delay para evitar rate limits.
   * 
   * @param {Array} savedRecipes - Array de recetas ya guardadas en la BD
   * @param {Array<string>} ingredients - Ingredientes para búsqueda mejorada
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<void>}
   * 
   * Explicación para entrevistas:
   * "Implementé generación asíncrona de imágenes para IA porque DALL-E es lento (~30-60 seg).
   * En lugar de hacer esperar al usuario, guardo las recetas con placeholder y genero las imágenes
   * en background. Esto mejora la UX de ~60 segundos a ~2 segundos de respuesta inicial."
   */
  async generateImagesInBackground(savedRecipes, ingredients, options = {}) {
    // Delay aumentado para evitar rate limits de Replicate
    const delayBetweenImages = options.aiImageDelay || 5000; // 5 segundos entre imágenes
    const imageStrategy = options.imageStrategy || process.env.IMAGE_STRATEGY || "free-ai";

    for (const recipe of savedRecipes) {
      try {
        // Marcar como procesando
        await Recipe.findByIdAndUpdate(recipe._id, {
          imageStatus: "processing",
        });

        // Generar imagen con IA (gratuita por defecto: Stable Diffusion)
        // Si falla, automáticamente usa stock images como fallback
        const imageUrl = await imageService.generateAndUploadImage(recipe.name, {
          ingredients: ingredients,
          strategy: imageStrategy,
          uploadToCloudinary: options.uploadToCloudinary !== false,
        });

        // Si se obtuvo una imagen (de IA o fallback), actualizar receta
        if (imageUrl) {
          await Recipe.findByIdAndUpdate(recipe._id, {
            urlImage: imageUrl,
            imageStatus: "completed",
          });

          console.log(`✅ Imagen obtenida para receta: ${recipe.name}`);
        } else {
          // Si no se obtuvo imagen, mantener placeholder y marcar como fallido
          await Recipe.findByIdAndUpdate(recipe._id, {
            imageStatus: "failed",
          });
          console.warn(`⚠️ No se pudo obtener imagen para ${recipe.name}, manteniendo placeholder`);
        }
      } catch (error) {
        console.error(`❌ Error procesando imagen para ${recipe.name}:`, error.message);
        
        // Intentar obtener stock image como último recurso
        try {
          const stockImageUrl = await stockImageService.getRecipeImage(recipe.name, ingredients);
          if (stockImageUrl) {
            await Recipe.findByIdAndUpdate(recipe._id, {
              urlImage: stockImageUrl,
              imageStatus: "completed",
            });
            console.log(`✅ Imagen de stock obtenida como último recurso para: ${recipe.name}`);
          } else {
            // Marcar como fallido pero mantener placeholder
            await Recipe.findByIdAndUpdate(recipe._id, {
              imageStatus: "failed",
            });
          }
        } catch (stockError) {
          // Si todo falla, mantener placeholder
          await Recipe.findByIdAndUpdate(recipe._id, {
            imageStatus: "failed",
          });
        }
      }

      // Delay entre imágenes para evitar rate limits (aumentado para Replicate)
      if (savedRecipes.indexOf(recipe) < savedRecipes.length - 1) {
        await this.sleep(delayBetweenImages);
      }
    }
  }

  /**
   * Utilidad para pausar ejecución
   * 
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Agrega imágenes a las recetas generadas (flujo síncrono para stock images)
   * 
   * @param {Array} recipes - Array de recetas sin imágenes
   * @param {Object} options - Opciones para generación de imágenes
   * @param {Array<string>} options.ingredients - Ingredientes para búsqueda mejorada
   * @returns {Promise<Array>} Recetas con URLs de imágenes
   */
  async addImagesToRecipes(recipes, options = {}) {
    try {
      // Preparar recetas con ingredientes para búsqueda mejorada
      const recipesWithIngredients = recipes.map((recipe) => ({
        name: recipe.name,
        ingredients: recipe.ingredients || options.ingredients || [],
      }));

      const imageUrls = await imageService.generateMultipleImages(recipesWithIngredients, {
        skipGeneration: options.skipImageGeneration || false,
        delayBetweenRequests: options.imageDelay || 200, // Más rápido con stock images
        strategy: options.imageStrategy || process.env.IMAGE_STRATEGY || "stock",
        uploadToCloudinary: options.uploadToCloudinary !== false, // Por defecto subir a Cloudinary
      });

      return recipes.map((recipe, index) => ({
        ...recipe,
        urlImage: imageUrls[index] || imageService.getPlaceholderImage(),
      }));
    } catch (error) {
      console.error("Error generando imágenes, usando placeholders:", error);
      // Fallback a placeholders mejorados si falla la generación
      return recipes.map((recipe) => ({
        ...recipe,
        urlImage: stockImageService.getImprovedPlaceholder(recipe.name),
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

  /**
   * Obtiene todas las recetas generadas por un usuario
   * 
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de consulta (limit, offset, sort)
   * @returns {Promise<Array>} Array de recetas generadas por el usuario
   * 
   * Explicación para entrevistas:
   * "Este método filtra las recetas por userId e isGenerated=true.
   * Esto permite que cada usuario vea solo sus propias recetas generadas,
   * siguiendo el principio de seguridad de datos por usuario."
   */
  async getGeneratedRecipesByUser(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      sort = "-createdAt", // Más recientes primero por defecto
    } = options;

    // Construir query
    const query = {
      userId: userId,
      isGenerated: true, // Solo recetas generadas por IA
    };

    // Parsear sort
    let sortOption = { createdAt: -1 }; // Por defecto: más recientes primero
    if (sort) {
      if (sort.startsWith("-")) {
        const field = sort.substring(1);
        sortOption = { [field]: -1 };
      } else {
        sortOption = { [sort]: 1 };
      }
    }

    try {
      const recipes = await Recipe.find(query)
        .sort(sortOption)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean(); // Usar lean() para mejor performance

      // Asegurar que siempre devolvemos un array
      return Array.isArray(recipes) ? recipes : [];
    } catch (error) {
      console.error("Error obteniendo recetas generadas:", error);
      throw createError(500, `Error al obtener recetas generadas: ${error.message}`);
    }
  }
}

module.exports = new RecipeService();

