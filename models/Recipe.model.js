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
  html: {
    type: String,
  },
});

const Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;
