const mongoose = require("mongoose");

const RecipeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  urlImage: {
    type: String,
    required: true,
  },
  phrase: {
    type: String,
    required: true,
  },
  preparationTime: {
    type: Number,
    required: true,
  },
  ingredients: {
    type: [String],
    required: true,
  },
  people: {
    type: Number,
    required: true,
  },
  steps: {
    type: [String],
    required: true,
  },
  caloricRate: {
    type: Number,
    required: true,
  },
  isFavorite: { 
    type: Boolean, 
    default: false,
  },
  type: {
    type: String,
    enum: ["desayuno", "comida", "cena"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Opcional para mantener compatibilidad con recetas existentes
  },
  isGenerated: {
    type: Boolean,
    default: false, // Indica si la receta fue generada por IA
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

const Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;
