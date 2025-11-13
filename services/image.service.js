const axios = require("axios");
const cloudinary = require("../config/cloudinary.config");
const aiService = require("./ai.service");
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
   * Genera una imagen usando IA y la sube a Cloudinary
   * 
   * @param {string} recipeName - Nombre de la receta
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<string>} URL de la imagen en Cloudinary
   * 
   * Explicación para entrevistas:
   * "Este servicio encapsula todo el proceso de generación de imágenes:
   * 1. Genera imagen con IA
   * 2. Descarga la imagen
   * 3. Sube a Cloudinary
   * Si mañana quiero cambiar de Cloudinary a otro servicio, solo modifico este archivo.
   * Esto sigue el principio de responsabilidad única."
   */
  async generateAndUploadImage(recipeName, options = {}) {
    try {
      // Paso 1: Generar imagen con IA
      const imagePrompt = generateImagePrompt(recipeName);
      const imageUrl = await aiService.generateImage(imagePrompt, {
        size: options.size || "512x512",
      });

      // Paso 2: Descargar imagen
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      // Paso 3: Subir a Cloudinary
      const cloudinaryUrl = await this.uploadToCloudinary(
        imageResponse.data,
        recipeName
      );

      return cloudinaryUrl;
    } catch (error) {
      // Si falla la generación de imagen, usar placeholder
      if (options.fallbackToPlaceholder !== false) {
        return this.getPlaceholderImage();
      }
      throw error;
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
   * @param {Array<Object>} recipes - Array de objetos con nombre de receta
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array<string>>} Array de URLs de imágenes
   * 
   * Explicación para entrevistas:
   * "Esta función procesa múltiples imágenes en paralelo pero con control de rate limiting.
   * Implementé un pequeño delay entre requests para evitar exceder límites de la API.
   * Esto optimiza el tiempo de respuesta mientras respeta los límites del proveedor."
   */
  async generateMultipleImages(recipes, options = {}) {
    const { delayBetweenRequests = 1000, skipGeneration = false } = options;

    if (skipGeneration) {
      // Opción para saltar generación y usar placeholders (reduce costos)
      return recipes.map(() => this.getPlaceholderImage());
    }

    const imagePromises = recipes.map(async (recipe, index) => {
      // Delay progresivo para evitar rate limits
      if (index > 0) {
        await this.sleep(delayBetweenRequests * index);
      }

      try {
        return await this.generateAndUploadImage(recipe.name, options);
      } catch (error) {
        console.error(`Error generando imagen para ${recipe.name}:`, error);
        return this.getPlaceholderImage();
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

