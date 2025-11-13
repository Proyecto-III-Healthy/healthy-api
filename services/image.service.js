const axios = require("axios");
const cloudinary = require("../config/cloudinary.config");
const aiService = require("./ai.service");
const stockImageService = require("./stock-image.service");
const { generateImagePrompt } = require("../templates/prompts.template");
const createError = require("http-errors");

/**
 * Image Service - Maneja generación y subida de imágenes
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de manejo de imágenes
 * - DRY: Una sola función para todo el proceso
 * - KISS: Proceso simplificado y opcional
 */
class ImageService {
  /**
   * Obtiene una imagen para una receta usando estrategia híbrida
   * 
   * Estrategia empresarial con fallback en cascada:
   * 1. Stock images (Unsplash/Foodish) - Gratis y rápido
   * 2. IA generation (DALL-E) - Solo si se requiere y está configurado
   * 3. Placeholder mejorado - Último recurso
   * 
   * @param {string} recipeName - Nombre de la receta
   * @param {Object} options - Opciones adicionales
   * @param {Array<string>} options.ingredients - Ingredientes para búsqueda mejorada
   * @param {string} options.strategy - "stock" (default), "ai", "hybrid"
   * @returns {Promise<string>} URL de la imagen
   * 
   * Explicación para entrevistas:
   * "Implementé una estrategia híbrida similar a la que usan empresas grandes:
   * - Stock images como primera opción (gratis, rápido, alta calidad)
   * - IA generation como opción premium (si está configurado)
   * - Fallback inteligente para garantizar siempre una imagen
   * Esto optimiza costos y velocidad mientras mantiene buena UX."
   */
  async generateAndUploadImage(recipeName, options = {}) {
    const {
      ingredients = [],
      strategy = process.env.IMAGE_STRATEGY || "stock", // "stock", "ai", "hybrid"
      fallbackToPlaceholder = true,
    } = options;

    // Estrategia 1: Stock Images (Recomendada - Gratis y rápido)
    if (strategy === "stock" || strategy === "hybrid") {
      try {
        const stockImageUrl = await stockImageService.getRecipeImage(
          recipeName,
          ingredients
        );
        if (stockImageUrl) {
          // Opcional: Subir a Cloudinary para cache y optimización
          // Solo si Cloudinary está configurado
          const hasCloudinaryConfig = 
            process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET;

          // Validar que la URL sea válida antes de procesarla
          if (!stockImageUrl || typeof stockImageUrl !== "string") {
            console.warn("URL de imagen inválida recibida de stock service");
            return stockImageService.getImprovedPlaceholder(recipeName);
          }

          // Opcional: Subir a Cloudinary para cache y optimización
          // Por defecto NO subimos stock images a Cloudinary (más rápido y simple)
          // Solo si explícitamente se solicita
          if (options.uploadToCloudinary === true && hasCloudinaryConfig) {
            try {
              const cloudinaryUrl = await this.uploadStockImageToCloudinary(stockImageUrl, recipeName);
              // Validar que Cloudinary retornó una URL válida
              if (cloudinaryUrl && typeof cloudinaryUrl === "string") {
                return cloudinaryUrl;
              }
              // Si Cloudinary retornó algo inválido, usar URL original
              return stockImageUrl;
            } catch (error) {
              console.warn("Error subiendo a Cloudinary, usando URL directa:", error.message);
              return stockImageUrl; // Usar URL directa si falla Cloudinary
            }
          }
          // Si Cloudinary no está configurado o está deshabilitado, usar URL directa
          return stockImageUrl;
        }
      } catch (error) {
        console.warn("Error obteniendo imagen de stock:", error);
      }
    }

    // Estrategia 2: IA Generation (Solo si está configurado y se requiere)
    if (strategy === "ai" || (strategy === "hybrid" && process.env.OPENAI_API_KEY)) {
      try {
        const imagePrompt = generateImagePrompt(recipeName);
        const imageUrl = await aiService.generateImage(imagePrompt, {
          size: options.size || "512x512",
        });

        // Descargar y subir a Cloudinary
        const imageResponse = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });

        const cloudinaryUrl = await this.uploadToCloudinary(
          imageResponse.data,
          recipeName
        );

        return cloudinaryUrl;
      } catch (error) {
        console.warn("Error generando imagen con IA:", error);
        // Continuar con fallback
      }
    }

    // Fallback: Placeholder mejorado
    if (fallbackToPlaceholder) {
      return stockImageService.getImprovedPlaceholder(recipeName);
    }

    throw createError(500, "No se pudo obtener imagen para la receta");
  }

  /**
   * Sube una imagen de stock a Cloudinary para cache y optimización
   * 
   * @param {string} imageUrl - URL de la imagen de stock
   * @param {string} publicId - ID público para Cloudinary
   * @returns {Promise<string>} URL de Cloudinary
   */
  async uploadStockImageToCloudinary(imageUrl, publicId) {
    // Validar que imageUrl sea una URL válida
    if (!imageUrl || typeof imageUrl !== "string") {
      console.warn("URL de imagen inválida, usando URL directa");
      return imageUrl || this.getPlaceholderImage();
    }

    // Validar formato de URL
    try {
      new URL(imageUrl);
    } catch (error) {
      console.warn(`URL de imagen inválida: ${imageUrl}, usando URL directa`);
      return imageUrl;
    }

    try {
      // Descargar imagen de stock
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 10000, // Aumentado a 10 segundos
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      // Validar que se recibió data
      if (!imageResponse.data || imageResponse.data.length === 0) {
        console.warn("Imagen descargada está vacía, usando URL directa");
        return imageUrl;
      }

      // Subir a Cloudinary
      return await this.uploadToCloudinary(imageResponse.data, publicId);
    } catch (error) {
      // Si falla, retornar URL original (mejor que fallar completamente)
      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        console.warn("No se pudo conectar para descargar imagen, usando URL directa");
      } else if (error.message && error.message.includes("Invalid URL")) {
        console.warn("URL inválida detectada, usando URL directa");
      } else {
        console.warn("Error subiendo imagen de stock a Cloudinary:", error.message || error);
      }
      return imageUrl; // Retornar URL original si falla
    }
  }

  /**
   * Sube una imagen a Cloudinary
   * 
   * @param {Buffer} imageBuffer - Buffer de la imagen
   * @param {string} publicId - ID público para Cloudinary
   * @returns {Promise<string>} URL de la imagen subida
   */
  uploadToCloudinary(imageBuffer, publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "recipe_images",
            public_id: publicId?.toLowerCase().replace(/\s+/g, "_"),
          },
          (error, result) => {
            if (error) {
              console.error("Error uploading to Cloudinary:", error);
              reject(createError(500, "Error subiendo imagen a Cloudinary"));
            } else {
              resolve(result.secure_url);
            }
          }
        )
        .end(imageBuffer);
    });
  }

  /**
   * Obtiene una URL de imagen placeholder
   * Útil para reducir costos de generación de imágenes
   * 
   * @returns {string} URL del placeholder
   */
  getPlaceholderImage() {
    // Puedes usar un servicio de placeholders como placeholder.com
    // o una imagen genérica de tu CDN
    return (
      process.env.PLACEHOLDER_IMAGE_URL ||
      "https://via.placeholder.com/512x512?text=Recipe+Image"
    );
  }

  /**
   * Genera imágenes para múltiples recetas de forma eficiente
   * 
   * Optimizado para stock images (más rápido que IA generation)
   * 
   * @param {Array<Object>} recipes - Array de objetos con nombre de receta e ingredients
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array<string>>} Array de URLs de imágenes
   * 
   * Explicación para entrevistas:
   * "Optimicé esta función para usar stock images que son mucho más rápidas que IA generation.
   * Con stock images, puedo procesar múltiples imágenes en paralelo con delays mínimos,
   * reduciendo el tiempo total de ~30-60 segundos a ~2-5 segundos para 5 recetas."
   */
  async generateMultipleImages(recipes, options = {}) {
    const {
      delayBetweenRequests = 200, // Más rápido con stock images
      skipGeneration = false,
      strategy = process.env.IMAGE_STRATEGY || "stock",
    } = options;

    if (skipGeneration) {
      // Opción para saltar generación y usar placeholders (reduce costos)
      return recipes.map((recipe) =>
        stockImageService.getImprovedPlaceholder(recipe.name)
      );
    }

    // Si usa stock images, usar el método optimizado del servicio
    if (strategy === "stock" || strategy === "hybrid") {
      try {
        return await stockImageService.getMultipleRecipeImages(recipes, {
          delayBetweenRequests,
        });
      } catch (error) {
        console.warn("Error obteniendo imágenes de stock, usando método individual:", error);
      }
    }

    // Fallback: método individual (para IA generation o si falla stock)
    const imagePromises = recipes.map(async (recipe, index) => {
      // Delay progresivo para evitar rate limits
      if (index > 0) {
        await this.sleep(delayBetweenRequests * index);
      }

      try {
        return await this.generateAndUploadImage(recipe.name, {
          ...options,
          ingredients: recipe.ingredients || [],
        });
      } catch (error) {
        console.error(`Error generando imagen para ${recipe.name}:`, error);
        return stockImageService.getImprovedPlaceholder(recipe.name);
      }
    });

    return Promise.all(imagePromises);
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
}

module.exports = new ImageService();

