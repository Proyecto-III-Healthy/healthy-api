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
      req.user = user;// Aquí asignamos el usuario al objeto req
      
      const prompt = `Quiero 5 recetas que usen estos ingredientes ${ingredients.join(
        ", "
      )}, 
      y tenga en cuenta estos aspectos del usuario , su objetivo es ${user?.objetive}, 
      su habilidad en la cocina es ${user?.ability},
      su tipo de dieta es ${user?.typeDiet} y es alérgico a ${user?.alergic},

      y la respuesta debe venir como un JSON que contenga una lista de recetas con esta estructura
      [
        {
          name: "Caldo de pollo...",
          urlImage: "http...",
          phrase: "Rico caldo...",
          preparationTime: 20,//minutos
          ingredients: ["1/2 litro de agua", "1kg de pollo", "3 tomates"],
          people: 4,//personas
          steps: ["Hervir", "cortar pollo"],
          caloricRate: 200,//kcal por plato
          isFavorite: false//false por defecto
        },
        ....
      ]`;
      console.log("PROMPT", prompt);
      return axios.post(
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
      );
    })
    .then((response) => {
      const recipes = JSON.parse(response.data.choices[0].message.content);
      const dallePpromiseAddUrlImage = recipes.recetas.map((recipe) => {
        const dallePrompt = `Crea una imagen para una receta llamada ${recipe.name}`;
        return axios
          .post(
            "https://api.openai.com/v1/images/generations",
            {
              prompt: dallePrompt,
              n: 1,
              size: "1024x1024",
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then((dalleResponse) => {
            recipe.urlImage = dalleResponse.data.data[0].url;
            return recipe;
          });
      });
      return Promise.all(dallePpromiseAddUrlImage);
    })
    .then((recipesWithUrlImage) => {
      req.body.recipes = recipesWithUrlImage;
      next();
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
