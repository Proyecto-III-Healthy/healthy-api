const mongoose = require("mongoose");
const dayPlanSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  meals: [
    {
      meal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meal",
      },
      time: {
        type: String,
        required: true,
      },
    },
  ],
});

const DayPlan = mongoose.model("DayPlan", dayPlanSchema);
module.exports = DayPlan;
