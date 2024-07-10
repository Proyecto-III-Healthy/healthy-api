const axios = require("axios");
const createError = require("http-errors");
const DayPlan = require("../models/DayPlan.model");
const WeeklyPlan = require("../models/WeeklyPlan.model");
const Meal = require("../models/Meal.model");
const createDailyMealPlan = require("../utils/createDailyMealPlan");
module.exports.generateDaylyMealPlan = (req, res, next) => {
  const { startDate, userPreferences, currentUserId } = req.body;
  const prompt = `
    Genera un plan diario de comidas teniendo en estas preferencias del usuario:
    - Objetivo: ${userPreferences.objetive}
    - Habilidad en la cocina: ${userPreferences.ability}
    - Tipo de dieta: ${userPreferences.typeDiet}
    - Alergias: ${userPreferences.alergic}
    El plan debe incluir desayuno, almuerzo y cena,
    cada meal tendra su receta que tedra los campos que te indico acontinuación y debe tener el siguiente formato y que sea un JSON válido sin comentarios que no falle con un JSON.parse():
    {
      "days": [
        {
          "date": "2024-06-24",
          "meals": [
            { "name": "Desayuno saludable", "type":"desayuno", "time": "2024-06-24T08:00:00", recipe:{
              "name": "Caldo de pollo...",
              "urlImage": "http...",
              "phrase": "Rico caldo...",
              "preparationTime": 20,//minutos
              "ingredients": ["1/2 litro de agua", "1kg de pollo", "3 tomates"],
              "people": 4,//personas
              "steps": ["Hervir", "cortar pollo"],
              "caloricRate": 200,//kcal por plato
              "isFavorite": false//false por defecto,
              "type": "desayuno"
            }
        },
        { "name": "Almuerzo ligero", "type":"comida", "time": "2024-06-24T13:00:00", recipe:{
                "name": "Caldo de pollo...",
                "urlImage": "http...",
                "phrase": "Rico caldo...",
                "preparationTime": 20,//minutos
                "ingredients": ["1/2 litro de agua", "1kg de pollo", "3 tomates"],
                "people": 4,//personas
                "steps": ["Hervir", "cortar pollo"],
                "caloricRate": 200,//kcal por plato
                "isFavorite": false//false por defecto,
                "type": "comida"
            }
        },
        { "name": "Cena ligera", type:"cena", "time": "2024-06-24T20:00:00", recipe:{
                "name": "Caldo de pollo...",
                "urlImage": "http...",
                "phrase": "Rico caldo...",
                "preparationTime": 20,//minutos
                "ingredients": ["1/2 litro de agua", "1kg de pollo", "3 tomates"],
                "people": 4,//personas
                "steps": ["Hervir", "cortar pollo"],
                "caloricRate": 200,//kcal por plato
                "isFavorite": false//false por defecto,
                "type": "cena"
              },
        }
      ]
    }
  `;
  console.log(prompt);
  console.log("in");
  axios
    .post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      console.log(response.data.choices[0].message.content);
      let dailyPlan;
      try {
        dailyPlan = JSON.parse(response.data.choices[0].message.content)
          .days[0];
      } catch (e) {
        console.error("Error parsing JSON:", e);
        return next(createError(500, "Invalid JSON format in response"));
      }
      console.log("**************dailyPlan", dailyPlan);
      const mealsByDay = dailyPlan.meals.map((meal) => ({
        name: meal.name,
        time: meal.time,
        type: meal.type,
        recipe: {
          name: meal.recipe.name,
          urlImage: meal.recipe.urlImage,
          phrase: meal.recipe.phrase,
          preparationTime: meal.recipe.preparationTime,
          ingredients: meal.recipe.ingredients,
          people: meal.recipe.people,
          steps: meal.recipe.steps,
          caloricRate: meal.recipe.caloricRate,
          isFavorite: meal.recipe.isFavorite,
          type: meal.recipe.type,
        },
      }));
      return createDailyMealPlan(startDate, mealsByDay, currentUserId);
    })
    .then((dailyMealPlan) => {
      return new DayPlan(dailyMealPlan).populate({
        path: "meals.meal",
        populate: { path: "recipe" },
      });
    })
    .then((dailyMealPlan) => {
      console.log("***************weeklyMealPlan", dailyMealPlan);
      res.json({
        dailyMealPlan,
      });
    })
    .catch((error) => {
      console.error("Error generating meal plan:", error);
      next(createError(500, "Error generating meal plan"));
    });
};
module.exports.getUserDayPlans = (req, res, next) => {
  DayPlan.find({ user: req.currentUserId })
    .populate({
      path: "meals.meal",
      populate: { path: "recipe" },
    })
    .then((dayPlans) => {
      console.log(dayPlans);
      res.json(dayPlans);
    })
    .catch((err) => next(err));
};
