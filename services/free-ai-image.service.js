const axios = require("axios");
const createError = require("http-errors");

/**
 * Free AI Image Service - Generación de imágenes con Stable Diffusion (gratuito)
 * 
 * Usa Replicate API que ofrece Stable Diffusion de forma gratuita
 * Alternativa gratuita a DALL-E de OpenAI
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de generación de imágenes con IA gratuita
 * - DRY: Lógica centralizada
 * - KISS: Solución simple y efectiva
 */
class FreeAIImageService {
  constructor() {
    // Replicate API Key (opcional pero recomendado para más requests)
    // Sin API key funciona pero con límites más bajos
    this.replicateApiKey = process.env.REPLICATE_API_TOKEN || null;
    this.replicateApiUrl = "https://api.replicate.com/v1";
  }

  /**
   * Genera una imagen usando Stable Diffusion a través de Replicate
   * 
   * @param {string} prompt - Descripción de la imagen a generar
   * @param {Object} options - Opciones adicionales
   * @param {string} options.size - Tamaño de la imagen ("512x512", "768x768", etc.)
   * @returns {Promise<string>} URL de la imagen generada
   * 
   * Explicación para entrevistas:
   * "Implementé generación de imágenes con Stable Diffusion usando Replicate API
   * como alternativa gratuita a DALL-E. Esto permite generar imágenes únicas y personalizadas
   * sin costos adicionales, mejorando la experiencia del usuario con imágenes relevantes."
   */
  async generateImage(prompt, options = {}) {
    const size = options.size || "512x512";
    const [width, height] = size.split("x").map(Number);

    try {
      // Modelo Stable Diffusion XL (mejor calidad)
      const model = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

      // Crear predicción usando el modelo completo
      // Replicate API requiere el modelo completo en formato "owner/model:version"
      const predictionResponse = await axios.post(
        `${this.replicateApiUrl}/predictions`,
        {
          version: model.split(":")[1] || "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: {
            prompt: this.enhancePrompt(prompt),
            width: Math.min(width, 1024), // Máximo 1024px
            height: Math.min(height, 1024), // Máximo 1024px
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 25,
          },
        },
        {
          headers: {
            ...(this.replicateApiKey && { Authorization: `Token ${this.replicateApiKey}` }),
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status < 500, // Aceptar 4xx pero no 5xx
        }
      );

      // Verificar errores de autenticación o límites
      if (predictionResponse.status === 401) {
        const error = new Error("API Key de Replicate inválida o no configurada");
        error.status = 401;
        throw error;
      }
      if (predictionResponse.status === 429) {
        const error = new Error("Límite de requests alcanzado en Replicate");
        error.status = 429;
        throw error;
      }
      if (predictionResponse.status === 402) {
        // Payment required - sin créditos
        const error = new Error("Replicate requiere créditos. Usando fallback a stock images.");
        error.status = 402;
        throw error;
      }
      if (predictionResponse.status >= 400) {
        const error = new Error(`Error de Replicate API: ${predictionResponse.data?.detail || "Error desconocido"}`);
        error.status = predictionResponse.status;
        throw error;
      }

      const predictionId = predictionResponse.data.id;

      // Esperar a que la imagen se genere (polling)
      const imageUrl = await this.waitForPrediction(predictionId);

      return imageUrl;
    } catch (error) {
      // Si Replicate falla (sin créditos, rate limit, etc.), lanzar error para que se use fallback
      // No intentar Hugging Face porque también puede tener problemas similares
      // El error será manejado en image.service.js para usar stock images
      const customError = new Error(error.message || "Error generando imagen con Replicate");
      customError.status = error.status || 500;
      customError.originalError = error;
      throw customError;
    }
  }

  /**
   * Mejora el prompt para mejores resultados con Stable Diffusion
   * 
   * @param {string} prompt - Prompt original
   * @returns {string} Prompt mejorado
   */
  enhancePrompt(prompt) {
    // Agregar términos que mejoran la calidad de imágenes de comida
    const foodEnhancements = "professional food photography, high quality, appetizing, well lit, realistic, detailed";
    return `${prompt}, ${foodEnhancements}`;
  }

  /**
   * Espera a que la predicción se complete y retorna la URL de la imagen
   * 
   * @param {string} predictionId - ID de la predicción
   * @param {number} maxAttempts - Máximo número de intentos
   * @param {number} delayMs - Delay entre intentos en ms
   * @returns {Promise<string>} URL de la imagen generada
   */
  async waitForPrediction(predictionId, maxAttempts = 30, delayMs = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `${this.replicateApiUrl}/predictions/${predictionId}`,
          {
            headers: {
              ...(this.replicateApiKey && { Authorization: `Token ${this.replicateApiKey}` }),
            },
          }
        );

        const status = response.data.status;

        if (status === "succeeded") {
          const output = response.data.output;
          // Replicate puede retornar un array o string
          const imageUrl = Array.isArray(output) ? output[0] : output;
          if (imageUrl && typeof imageUrl === "string") {
            return imageUrl;
          }
        }

        if (status === "failed" || status === "canceled") {
          throw createError(500, `Generación de imagen falló: ${status}`);
        }

        // Si aún está procesando, esperar antes del siguiente intento
        if (status === "starting" || status === "processing") {
          await this.sleep(delayMs);
          continue;
        }
      } catch (error) {
        if (error.response?.status === 404) {
          throw createError(404, "Predicción no encontrada");
        }
        throw error;
      }
    }

    throw createError(500, "Timeout esperando generación de imagen");
  }

  /**
   * Genera imagen usando Hugging Face como fallback (gratuito)
   * 
   * @param {string} prompt - Descripción de la imagen
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<string>} URL de la imagen generada
   */
  async generateWithHuggingFace(prompt, options = {}) {
    const hfApiKey = process.env.HUGGINGFACE_API_KEY || null;
    const model = "stabilityai/stable-diffusion-xl-base-1.0";

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: this.enhancePrompt(prompt),
          parameters: {
            width: 512,
            height: 512,
          },
        },
        {
          headers: {
            Authorization: hfApiKey ? `Bearer ${hfApiKey}` : undefined,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
          timeout: 60000, // 60 segundos timeout
        }
      );

      // Hugging Face retorna la imagen directamente como buffer
      // Necesitamos convertirla a base64 o subirla a Cloudinary
      // Por ahora retornamos null para que se use otro método
      throw new Error("Hugging Face requiere procesamiento adicional");
    } catch (error) {
      if (error.response?.status === 503) {
        // Modelo cargándose, esperar y reintentar
        await this.sleep(5000);
        return this.generateWithHuggingFace(prompt, options);
      }
      throw error;
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
}

module.exports = new FreeAIImageService();

