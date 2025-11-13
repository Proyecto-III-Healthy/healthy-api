/**
 * Recipe Normalizer - Normaliza y valida datos de recetas antes de guardarlos
 * 
 * Principios aplicados:
 * - SRP: Responsabilidad única de normalización
 * - DRY: Lógica centralizada de validación
 * - Defensive Programming: Maneja variaciones de la IA
 */

/**
 * Mapeo de valores comunes de tipo de comida a valores válidos del enum
 */
const TYPE_MAPPING = {
  // Desayuno
  "desayuno": "desayuno",
  "desayuno saludable": "desayuno",
  "desayuno ligero": "desayuno",
  "desayuno completo": "desayuno",
  "breakfast": "desayuno",
  "morning meal": "desayuno",
  
  // Comida/Almuerzo
  "comida": "comida",
  "almuerzo": "comida",
  "almuerzo ligero": "comida",
  "comida ligera": "comida",
  "comida completa": "comida",
  "lunch": "comida",
  "midday meal": "comida",
  
  // Cena
  "cena": "cena",
  "cena ligera": "cena",
  "cena completa": "cena",
  "dinner": "cena",
  "evening meal": "cena",
  "supper": "cena",
};

/**
 * Valores válidos del enum según el modelo
 */
const VALID_TYPES = ["desayuno", "comida", "cena"];

/**
 * Normaliza el tipo de comida a un valor válido del enum
 * 
 * @param {string} type - Tipo de comida (puede ser variación)
 * @param {string} fallback - Valor por defecto si no se puede mapear
 * @returns {string} Tipo normalizado
 */
function normalizeRecipeType(type, fallback = "comida") {
  if (!type || typeof type !== "string") {
    return fallback;
  }

  // Normalizar a minúsculas y quitar espacios extra
  const normalized = type.toLowerCase().trim();

  // Si ya es un valor válido, devolverlo
  if (VALID_TYPES.includes(normalized)) {
    return normalized;
  }

  // Buscar en el mapeo
  if (TYPE_MAPPING[normalized]) {
    return TYPE_MAPPING[normalized];
  }

  // Buscar coincidencias parciales
  for (const [key, value] of Object.entries(TYPE_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Si no se encuentra, usar fallback
  console.warn(`Tipo de comida no reconocido: "${type}". Usando fallback: "${fallback}"`);
  return fallback;
}

/**
 * Normaliza y valida una receta completa
 * 
 * @param {Object} recipe - Receta sin normalizar
 * @returns {Object} Receta normalizada y validada
 */
function normalizeRecipe(recipe) {
  if (!recipe || typeof recipe !== "object") {
    throw new Error("Receta inválida: debe ser un objeto");
  }

  // Normalizar tipo
  const normalizedType = normalizeRecipeType(recipe.type, "comida");

  // Validar campos requeridos
  const normalizedRecipe = {
    name: String(recipe.name || "").trim(),
    urlImage: String(recipe.urlImage || "").trim(),
    phrase: String(recipe.phrase || "").trim(),
    preparationTime: Number(recipe.preparationTime) || 30,
    ingredients: Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.map(ing => String(ing).trim()).filter(ing => ing.length > 0)
      : [],
    people: Number(recipe.people) || 2,
    steps: Array.isArray(recipe.steps)
      ? recipe.steps.map(step => String(step).trim()).filter(step => step.length > 0)
      : [],
    caloricRate: Number(recipe.caloricRate) || 300,
    isFavorite: Boolean(recipe.isFavorite),
    type: normalizedType,
  };

  // Validaciones adicionales
  if (!normalizedRecipe.name) {
    throw new Error("El nombre de la receta es requerido");
  }

  if (normalizedRecipe.ingredients.length === 0) {
    throw new Error("La receta debe tener al menos un ingrediente");
  }

  if (normalizedRecipe.steps.length === 0) {
    throw new Error("La receta debe tener al menos un paso");
  }

  // Validar rangos razonables
  if (normalizedRecipe.preparationTime < 1 || normalizedRecipe.preparationTime > 600) {
    normalizedRecipe.preparationTime = 30; // Valor por defecto si es inválido
  }

  if (normalizedRecipe.people < 1 || normalizedRecipe.people > 20) {
    normalizedRecipe.people = 2; // Valor por defecto
  }

  if (normalizedRecipe.caloricRate < 0 || normalizedRecipe.caloricRate > 5000) {
    normalizedRecipe.caloricRate = 300; // Valor por defecto
  }

  return normalizedRecipe;
}

/**
 * Normaliza un array de recetas
 * 
 * @param {Array} recipes - Array de recetas sin normalizar
 * @returns {Array} Array de recetas normalizadas
 */
function normalizeRecipes(recipes) {
  if (!Array.isArray(recipes)) {
    throw new Error("Las recetas deben ser un array");
  }

  return recipes.map((recipe, index) => {
    try {
      return normalizeRecipe(recipe);
    } catch (error) {
      console.error(`Error normalizando receta ${index + 1}:`, error.message);
      // Si falla la normalización, intentar con valores por defecto
      return normalizeRecipe({
        ...recipe,
        name: recipe.name || `Receta ${index + 1}`,
        type: normalizeRecipeType(recipe.type, "comida"),
      });
    }
  });
}

module.exports = {
  normalizeRecipeType,
  normalizeRecipe,
  normalizeRecipes,
  VALID_TYPES,
};

