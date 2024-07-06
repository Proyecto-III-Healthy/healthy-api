const mongoose = require("mongoose");

const mealSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["desayuno", "comida", "cena"],
    required: true,
  },
  recipe: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
    },
   // Referencia a recetas
  time: {
    type: String,
  }
});

const Meal = mongoose.model("Meal", mealSchema);
module.exports = Meal;
