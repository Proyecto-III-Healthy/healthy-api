const axios = require("axios");

const createError = require("http-errors");
const DayPlan = require("./../models/DayPlan.model");
const WeeklyPlan = require("./../models/WeeklyPlan.model");
const Meal = require("./../models/Meal.model");
const createWeeklyMealPlan = require("../utils/createWeeklyMealPlan");

module.exports.generateWeeklyMealPlan = (req, res, next) => {
  const { startDate, userPreferences } = req.body;
  console.log(req.body);

  const prompt = `
    Genera un plan semanal de comidas basado en estas preferencias del usuario:
    - Objetivo: ${userPreferences.objetive}
    - Habilidad en la cocina: ${userPreferences.ability}
    - Tipo de dieta: ${userPreferences.typeDiet}
    - Alergias: ${userPreferences.alergic}
    
    El plan debe incluir desayuno, almuerzo y cena para cada día de la semana y debe tener el siguiente formato y que sea un JSON válido sin comentarios:

    {
      "days": [
        {
          "date": "2024-06-24",
          "meals": [
            { "name": "Desayuno saludable", type:"desayuno", "time": "08:00", recipe:{
              name: "Caldo de pollo...",
              urlImage: "http...",
              phrase: "Rico caldo...",
              preparationTime: 20,//minutos
              ingredients: ["1/2 litro de agua", "1kg de pollo", "3 tomates"],
              people: 4,//personas
              steps: ["Hervir", "cortar pollo"],
              caloricRate: 200,//kcal por plato
              isFavorite: false//false por defecto,
              type: "desayuno
            },
         },
            { "name": "Almuerzo ligero", type:"comida", "time": "13:00", recipe:{
                name: "Caldo de pollo...",
                urlImage: "http...",
                phrase: "Rico caldo...",
                preparationTime: 20,//minutos
                ingredients: ["1/2 litro de agua", "1kg de pollo", "3 tomates"],
                people: 4,//personas
                steps: ["Hervir", "cortar pollo"],
                caloricRate: 200,//kcal por plato
                isFavorite: false//false por defecto,
                type: "comida
            }, 
        },
              { "name": "Cena ligera", type:"cena", "time": "20:00", recipe:{
                name: "Caldo de pollo...",
                urlImage: "http...",
                phrase: "Rico caldo...",
                preparationTime: 20,//minutos
                ingredients: ["1/2 litro de agua", "1kg de pollo", "3 tomates"],
                people: 4,//personas
                steps: ["Hervir", "cortar pollo"],
                caloricRate: 200,//kcal por plato
                isFavorite: false//false por defecto,
                type: "cena
              }, 
        }
          ]
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
      const weeklyPlan = JSON.parse(
        response.data.choices[0].message.content
      ).days;
      console.log(weeklyPlan);
      const mealsByDay = weeklyPlan.map((day) =>
        day.meals.map((meal) => ({
          name: meal.name,
          ingredients: meal.ingredients,
          time: meal.time,
          type: meal.type,
          recipe: {
            //campos del recipe
          }
        }))
      );

      return createWeeklyMealPlan(startDate, mealsByDay);
    })
    .then((weeklyMealPlan) => {
      return new WeeklyPlan(weeklyMealPlan).populate({
        path: "days",
        populate: { path: "meals.meal", populate: { path: 'recipe' } },
      });
    })
    .then((weeklyMealPlan) => {
      res.json({
        message: "Weekly meal plan created successfully",
        weeklyMealPlan,
      });
    })
    .catch((error) => {
      console.error("Error generating meal plan:", error);
      next(createError(500, "Error generating meal plan"));
    });
};
