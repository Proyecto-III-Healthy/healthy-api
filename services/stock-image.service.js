const axios = require("axios");
const createError = require("http-errors");

/**
 * Stock Image Service - Obtiene imágenes de stock gratuitas para recetas
 * 
 * Estrategia empresarial:
 * - Usa múltiples fuentes con fallback en cascada
 * - Optimizado para velocidad y disponibilidad
 * - Sin costos de generación de IA
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de obtención de imágenes de stock
 * - DRY: Lógica centralizada
 * - KISS: Solución simple y efectiva
 */
class StockImageService {
  constructor() {
    // API Keys (opcionales para límites más altos)
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || "public";
    this.pexelsApiKey = process.env.PEXELS_API_KEY || null;
  }

  /**
   * Obtiene una imagen de receta usando múltiples fuentes con fallback
   * 
   * @param {string} recipeName - Nombre de la receta
   * @param {Array<string>} ingredients - Ingredientes principales (opcional)
   * @returns {Promise<string>} URL de la imagen
   * 
   * Estrategia de fallback:
   * 1. Unsplash (si tiene API key - búsqueda específica)
   * 2. Foodish (imagen aleatoria de comida - funciona sin API key)
   * 3. Placeholder mejorado
   */
  async getRecipeImage(recipeName, ingredients = []) {
    // Validar que recipeName no esté vacío
    if (!recipeName || typeof recipeName !== "string" || recipeName.trim().length === 0) {
      return this.getImprovedPlaceholder("food");
    }

    // Intentar Unsplash primero (solo si tiene API key)
    if (this.unsplashAccessKey && this.unsplashAccessKey !== "public") {
      try {
        const unsplashUrl = await this.getUnsplashImage(recipeName, ingredients);
        if (unsplashUrl) {
          return unsplashUrl;
        }
      } catch (error) {
        console.log(`Unsplash falló para "${recipeName}", intentando siguiente fuente...`);
      }
    }

    // Fallback a Foodish (imagen genérica de comida - funciona sin API key)
    try {
      const foodishUrl = await this.getFoodishImage();
      if (foodishUrl) {
        return foodishUrl;
      }
    } catch (error) {
      console.log(`Foodish falló, usando placeholder...`);
    }

    // Último recurso: placeholder mejorado
    return this.getImprovedPlaceholder(recipeName);
  }

  /**
   * Obtiene imagen de Unsplash (recomendado - mejor calidad)
   * 
   * @param {string} recipeName - Nombre de la receta
   * @param {Array<string>} ingredients - Ingredientes principales
   * @returns {Promise<string|null>} URL de la imagen o null si falla
   */
  async getUnsplashImage(recipeName, ingredients = []) {
    // Si no hay API key, saltar Unsplash (requiere autenticación)
    if (!this.unsplashAccessKey || this.unsplashAccessKey === "public") {
      return null;
    }

    try {
      // Construir query de búsqueda inteligente
      const searchQuery = this.buildSearchQuery(recipeName, ingredients);

      // Validar que searchQuery no esté vacío
      if (!searchQuery || searchQuery.trim().length === 0) {
        return null;
      }

      // Llamar a Unsplash API
      const response = await axios.get("https://api.unsplash.com/search/photos", {
        params: {
          query: searchQuery,
          per_page: 1,
          orientation: "landscape",
          content_filter: "high",
        },
        headers: {
          Authorization: `Client-ID ${this.unsplashAccessKey}`,
        },
        timeout: 5000,
      });

      if (response.data?.results?.length > 0) {
        const image = response.data.results[0];
        // Retornar URL optimizada (regular size, suficiente para cards)
        const imageUrl = image.urls?.regular || image.urls?.small || image.urls?.raw;
        
        // Validar que la URL sea válida
        if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("http")) {
          return imageUrl;
        }
      }

      return null;
    } catch (error) {
      // Log del error para debugging
      if (error.response) {
        console.warn(`Unsplash API error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        console.warn("Unsplash API: No se recibió respuesta");
      } else {
        console.warn(`Unsplash API error: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Obtiene imagen aleatoria de comida de Foodish API
   * 
   * @returns {Promise<string|null>} URL de la imagen o null si falla
   */
  async getFoodishImage() {
    try {
      // Foodish API - funciona sin autenticación
      const response = await axios.get("https://foodish-api.herokuapp.com/images/", {
        timeout: 5000,
        validateStatus: (status) => status < 500, // Aceptar 4xx pero no 5xx
      });

      if (response.data?.image) {
        const imageUrl = response.data.image;
        // Validar que la URL sea válida
        if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("http")) {
          return imageUrl;
        }
      }

      return null;
    } catch (error) {
      // Log del error para debugging
      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        console.warn("Foodish API no disponible, usando placeholder");
      } else if (error.response) {
        console.warn(`Foodish API error: ${error.response.status}`);
      } else {
        console.warn(`Foodish API error: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Construye query de búsqueda inteligente para Unsplash
   * 
   * @param {string} recipeName - Nombre de la receta
   * @param {Array<string>} ingredients - Ingredientes principales
   * @returns {string} Query optimizada
   */
  buildSearchQuery(recipeName, ingredients = []) {
    // Limpiar nombre de receta (remover palabras comunes)
    const cleanName = recipeName
      .toLowerCase()
      .replace(/\b(al|con|de|la|las|los|el|del|en|para|por)\b/g, "")
      .trim();

    // Si hay ingredientes principales, agregarlos
    if (ingredients.length > 0) {
      const mainIngredients = ingredients.slice(0, 2).join(" ");
      return `${cleanName} ${mainIngredients} food`;
    }

    return `${cleanName} food dish`;
  }

  /**
   * Placeholder mejorado con imagen genérica de comida
   * 
   * @param {string} recipeName - Nombre de la receta (para personalización futura)
   * @returns {string} URL del placeholder
   */
  getImprovedPlaceholder(recipeName = "") {
    // Usar un servicio de placeholder con imagen de comida
    // Opción 1: Placeholder.com con imagen de comida
    const encodedName = encodeURIComponent(recipeName || "food");
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=512&h=512&fit=crop&q=80`;
    
    // Opción 2: Placeholder mejorado con texto
    // return `https://via.placeholder.com/512x512/83a580/ffffff?text=${encodedName}`;
  }

  /**
   * Obtiene múltiples imágenes de forma eficiente
   * 
   * @param {Array<Object>} recipes - Array de recetas con name e ingredients
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array<string>>} Array de URLs de imágenes
   */
  async getMultipleRecipeImages(recipes, options = {}) {
    const { delayBetweenRequests = 200 } = options; // Delay más corto que DALL-E

    const imagePromises = recipes.map(async (recipe, index) => {
      // Pequeño delay para evitar rate limits
      if (index > 0) {
        await this.sleep(delayBetweenRequests * index);
      }

      try {
        return await this.getRecipeImage(
          recipe.name,
          recipe.ingredients || []
        );
      } catch (error) {
        console.error(`Error obteniendo imagen para ${recipe.name}:`, error);
        return this.getImprovedPlaceholder(recipe.name);
      }
    });

    return Promise.all(imagePromises);
  }

  /**
   * Utilidad para pausar ejecución
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new StockImageService();

