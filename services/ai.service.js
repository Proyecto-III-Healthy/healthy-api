const axios = require("axios");
const createError = require("http-errors");

/**
 * AI Service - Centraliza todas las comunicaciones con APIs de IA
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de comunicación con IA
 * - DIP: Dependencia de abstracción (fácil cambiar proveedor)
 * - DRY: Una sola función para todas las llamadas
 */
class AIService {
  constructor() {
    // Configuración del proveedor de IA
    // Puede cambiar fácilmente entre OpenAI, Groq, etc.
    this.provider = process.env.AI_PROVIDER || "openai";
    this.apiKey = this.getApiKey();
    this.baseUrl = this.getBaseUrl();
    this.model = this.getModel();
  }

  /**
   * Obtiene la API key según el proveedor configurado
   * @returns {string} API Key
   */
  getApiKey() {
    const keyMap = {
      openai: process.env.OPENAI_API_KEY,
      groq: process.env.GROQ_API_KEY,
    };
    
    const apiKey = keyMap[this.provider];
    if (!apiKey) {
      throw new Error(`API Key no configurada para el proveedor: ${this.provider}`);
    }
    return apiKey;
  }

  /**
   * Obtiene la URL base según el proveedor
   * @returns {string} Base URL
   */
  getBaseUrl() {
    const urlMap = {
      openai: "https://api.openai.com/v1",
      groq: "https://api.groq.com/openai/v1",
    };
    return urlMap[this.provider] || urlMap.openai;
  }

  /**
   * Obtiene el modelo según el proveedor
   * @returns {string} Model name
   */
  getModel() {
    const modelMap = {
      openai: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      // Modelos disponibles en Groq (2024):
      // - llama-3.3-70b-versatile (recomendado, más potente)
      // - llama-3.1-8b-instant (más rápido, menos potente)
      groq: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    };
    return modelMap[this.provider] || modelMap.openai;
  }

  /**
   * Genera texto usando IA basado en un prompt
   * 
   * @param {string} prompt - El prompt para la IA
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<string>} Respuesta de la IA
   * 
   * Explicación para entrevistas:
   * "Esta función encapsula toda la lógica de comunicación con la API de IA.
   * Si mañana quiero cambiar de OpenAI a Groq, solo cambio la variable de entorno
   * AI_PROVIDER. Esto sigue el principio de inversión de dependencias."
   */
  async generateText(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          ...options,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Genera texto y lo parsea como JSON
   * Útil para respuestas estructuradas de la IA
   * 
   * @param {string} prompt - El prompt para la IA
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Objeto parseado desde JSON
   */
  async generateJSON(prompt, options = {}) {
    try {
      const textResponse = await this.generateText(prompt, options);
      
      // Limpiar posibles markdown code blocks
      const cleanedResponse = textResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      return JSON.parse(cleanedResponse);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw createError(500, "La IA no devolvió un JSON válido");
      }
      throw error;
    }
  }

  /**
   * Genera una imagen usando DALL-E o equivalente
   * 
   * @param {string} prompt - Descripción de la imagen
   * @param {Object} options - Opciones (size, n, etc.)
   * @returns {Promise<string>} URL de la imagen generada
   */
  async generateImage(prompt, options = {}) {
    try {
      // Solo OpenAI tiene generación de imágenes por ahora
      if (this.provider !== "openai") {
        throw createError(400, "Generación de imágenes solo disponible con OpenAI");
      }

      const response = await axios.post(
        `${this.baseUrl.replace("/chat/completions", "")}/images/generations`,
        {
          prompt,
          n: options.n || 1,
          size: options.size || "512x512",
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data[0].url;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Maneja errores de la API de IA de forma centralizada
   * 
   * @param {Error} error - Error capturado
   * @throws {Error} Error formateado
   */
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 429:
          throw createError(429, "Límite de solicitudes excedido. Por favor intenta más tarde.");
        case 401:
          throw createError(401, "API Key inválida o no autorizada");
        case 400:
          throw createError(400, `Error en la solicitud: ${data.error?.message || "Bad Request"}`);
        default:
          throw createError(500, `Error del proveedor de IA: ${data.error?.message || "Error desconocido"}`);
      }
    }

    throw createError(500, "Error de conexión con el proveedor de IA");
  }
}

// Exportar una instancia singleton
// Explicación: "Uso el patrón Singleton para evitar crear múltiples instancias
// del servicio, optimizando recursos y manteniendo consistencia."
module.exports = new AIService();

