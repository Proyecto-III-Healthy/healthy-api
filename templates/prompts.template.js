/**
 * Templates de Prompts para IA
 * 
 * Principios aplicados:
 * - SRP: Separación de concerns (prompts separados de lógica)
 * - KISS: Prompts simples y claros
 * - DRY: Templates reutilizables
 */

/**
 * Template para generar recetas basadas en ingredientes
 * 
 * @param {Array<string>} ingredients - Lista de ingredientes
 * @param {Object} userPreferences - Preferencias del usuario
 * @returns {string} Prompt formateado
 * 
 * Explicación para entrevistas:
 * "Separé los prompts en templates para que sean más mantenibles.
 * Si necesito ajustar cómo se generan las recetas, solo modifico este template
 * sin tocar la lógica de negocio. Esto sigue el principio de responsabilidad única."
 */
function generateRecipesPrompt(ingredients, userPreferences) {
  return `Genera exactamente 5 recetas usando estos ingredientes: ${ingredients.join(", ")}.

Considera estas preferencias del usuario:
- Objetivo: ${userPreferences.objetive || "general"}
- Habilidad culinaria: ${userPreferences.ability || "intermedia"}
- Tipo de dieta: ${userPreferences.typeDiet || "sin restricciones"}
- Alergias: ${userPreferences.alergic || "ninguna"}

REGLAS CRÍTICAS PARA EL CAMPO "type":
- El campo "type" SOLO puede tener uno de estos 3 valores EXACTOS: "desayuno", "comida", o "cena"
- NO uses variaciones como "comida ligera", "almuerzo", "desayuno saludable", etc.
- Si es para la mañana → usa "desayuno"
- Si es para el mediodía → usa "comida"
- Si es para la noche → usa "cena"

IMPORTANTE: Responde SOLO con un JSON válido, sin texto adicional, sin comentarios, sin markdown.
El JSON debe tener esta estructura exacta:

{
  "recetas": [
    {
      "name": "Nombre de la receta",
      "urlImage": "placeholder",
      "phrase": "Descripción breve y atractiva",
      "preparationTime": 30,
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "people": 4,
      "steps": ["Paso 1", "Paso 2"],
      "caloricRate": 250,
      "isFavorite": false,
      "type": "comida"
    }
  ]
}

Recuerda: El campo "type" DEBE ser exactamente "desayuno", "comida" o "cena". Nada más.`;
}

/**
 * Template para generar un plan diario de comidas (3 comidas)
 * 
 * @param {Object} userPreferences - Preferencias del usuario
 * @param {string} date - Fecha del plan (YYYY-MM-DD)
 * @returns {string} Prompt formateado
 * 
 * Explicación para entrevistas:
 * "Simplifiqué el prompt para generar solo un día (3 comidas) en lugar de toda la semana.
 * Esto reduce el tamaño del prompt, mejora la calidad de la respuesta y sigue el principio KISS."
 */
function generateDailyMealPlanPrompt(userPreferences, date) {
  return `Genera un plan de comidas para el día ${date} con estas preferencias:
- Objetivo: ${userPreferences.objetive || "general"}
- Habilidad culinaria: ${userPreferences.ability || "intermedia"}
- Tipo de dieta: ${userPreferences.typeDiet || "sin restricciones"}
- Alergias: ${userPreferences.alergic || "ninguna"}

El plan debe incluir 3 comidas: desayuno, comida y cena.

IMPORTANTE: Responde SOLO con un JSON válido, sin texto adicional, sin comentarios, sin markdown.
El JSON debe tener esta estructura exacta:

{
  "date": "${date}",
  "meals": [
    {
      "name": "Nombre del desayuno",
      "type": "desayuno",
      "time": "${date}T08:00:00",
      "recipe": {
        "name": "Nombre de la receta",
        "urlImage": "placeholder",
        "phrase": "Descripción breve",
        "preparationTime": 20,
        "ingredients": ["ingrediente 1", "ingrediente 2"],
        "people": 2,
        "steps": ["Paso 1", "Paso 2"],
        "caloricRate": 300,
        "isFavorite": false,
        "type": "desayuno"
      }
    },
    {
      "name": "Nombre de la comida",
      "type": "comida",
      "time": "${date}T13:00:00",
      "recipe": {
        "name": "Nombre de la receta",
        "urlImage": "placeholder",
        "phrase": "Descripción breve",
        "preparationTime": 45,
        "ingredients": ["ingrediente 1", "ingrediente 2"],
        "people": 2,
        "steps": ["Paso 1", "Paso 2"],
        "caloricRate": 600,
        "isFavorite": false,
        "type": "comida"
      }
    },
    {
      "name": "Nombre de la cena",
      "type": "cena",
      "time": "${date}T20:00:00",
      "recipe": {
        "name": "Nombre de la receta",
        "urlImage": "placeholder",
        "phrase": "Descripción breve",
        "preparationTime": 30,
        "ingredients": ["ingrediente 1", "ingrediente 2"],
        "people": 2,
        "steps": ["Paso 1", "Paso 2"],
        "caloricRate": 400,
        "isFavorite": false,
        "type": "cena"
      }
    }
  ]
}`;
}

/**
 * Template para generar prompt de imagen de receta
 * 
 * @param {string} recipeName - Nombre de la receta
 * @returns {string} Prompt para generación de imagen
 */
function generateImagePrompt(recipeName) {
  return `Crea una imagen apetitosa y profesional de un plato de comida llamado "${recipeName}". 
La imagen debe ser realista, bien iluminada y mostrar el plato de forma atractiva.`;
}

module.exports = {
  generateRecipesPrompt,
  generateDailyMealPlanPrompt,
  generateImagePrompt,
};

