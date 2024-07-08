const mongoose = require("mongoose");
const User = require("./../models/User.model");
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

const DayPlan = mongoose.model("DayPlan", dayPlanSchema);
module.exports = DayPlan;
