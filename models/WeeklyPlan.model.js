const mongoose = require("mongoose");
const weeklyMealPlanSchema = mongoose.Schema({
  weekStart: {
    type: Date,
    required: true,
  }, // Fecha de inicio de la semana
  days: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DayPlan",
    },
  ],
});

const WeeklyMealPlan = mongoose.model("WeeklyMealPlan", weeklyMealPlanSchema);
module.exports = WeeklyMealPlan;
