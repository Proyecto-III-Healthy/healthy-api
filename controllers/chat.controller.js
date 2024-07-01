const axios = require("axios");
const User = require("./../models/User.model");
const Recipe = require("./../models/Recipe.model");
const createError = require("http-errors");
module.exports.getRecipes = (req, res, next) => {
  const ingredients = req.body.ingredients;
 
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).send({ error: "Los ingredientes necesarios" });
  }
 
  User.findById(req.currentUserId)
    .then((user) => {
      
      if (!user) {
       next(createError(402, "User not found ahora"));
       
      }
      const prompt = `Quiero una receta que use estos ingredientes ${ingredients.join(
        ", "
      )}, 
      y tenga en cuenta estos aspectos del usuario ${user?.ability},
      y la respuesta debe venir como un JSON String que cumpla con esta estructura
      {
        name: "Caldo de pollo...",
        urlImage: "http...",
        phrase: "Rico caldo...",
        preparationTime: 20,//minutos
        ingredients: ["agua", "pollo"],
        people: 4,//personas
        steps: ["Hervir", "cortar pollo"],
        caloricRate: 200,//kcal por plato
        isFavorite: false
      }`;
      console.log("PROMPT", prompt);
      return axios
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
        
    })
    .then((response) => {
      
      const recipeObj = JSON.parse(response.data.choices[0].message.content)
      //res.send(response.data.choices[0].message.content)
      return Recipe.create(recipeObj)
      
    })
    .then((createdRecipe) => {
      
      res.json({
        createdRecipe
      });
    })

    .catch((error) => {
      if (error.response && error.response.status === 429) {
        // Handle rate limit error
        console.error("Rate limit exceeded:", error.response.data);
        res
          .status(429)
          .send({ error: "Rate limit exceeded. Please try again later." });
      } else {
        // Handle other errors
        console.error("Error:", error);
        //res.status(500).send({ error: "Something went wrong" });
      }
    });
};
