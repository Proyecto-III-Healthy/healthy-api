const axios = require("axios");
const User = require("./../models/User.model");
const Recipe = require("./../models/Recipe.model");
const createError = require("http-errors");
const { sendEmail } = require("./../config/nodemailer.config");
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
      req.user = user; // Aquí asignamos el usuario al objeto req

      const prompt = `Quiero 5 recetas que usen estos ingredientes ${ingredients.join(
        ", "
      )}, 
      y tenga en cuenta estos aspectos del usuario , su objetivo es ${
        user?.objetive
      }, 
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
      console.log(recipes);
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

module.exports.saveRecipes = (req, res) => {
  const { recipes } = req.body;
  Recipe.insertMany(recipes)
    .then((createdRecipes) => {
      const userEmail = req.user.email; // Asegúrate de que el email del usuario esté disponible
      const subject = "Tus recetas solicitadas";
      const text = "Aquí tienes las recetas que solicitaste:";
      const html = `

        <h1>Tus recetas solicitadas</h1>
      
          ${createdRecipes
            .map(
              (recipe) =>
                `
          <div
          className="card mb-3 mt-5"
          style="max-width: 540px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 30px;"
          key="${recipe._id}"
          >
            <div className="row g-0" style="display: flex;">
              <div className="col-md-4" style="flex: 1;">
                <img
                  src="${recipe.urlImage}"
                  style="width: 100%; height: auto; border-radius: 8px 0 0 8px;"
                  alt="${recipe.name}"
                />
                 
              </div>
              <div className="col-md-8" style="flex: 2; padding: 16px;">
                <div className="card-body">
                  <h5 className="card-title" style="margin: 0; font-size: 1.25rem;">${recipe.name}</h5>
                  <p className="card-text" style="margin: 8px 0;">${recipe.phrase}</p>
                  <p className="card-text" style="margin: 8px 0;">
                    <small className="text-muted">
                      ${recipe.preparationTime} min
                    </small>
                  </p>
                  <a href="${process.env.FRONTEND_URL}/recipes/${recipe._id}" style="color: #83a580; text-decoration: none;">Ver detalles</a>
                </div>
              </div>
            </div>
          </div>
        `
            )

            .join("")}
            <div className="col-md-4" style="width: 100%; flex: 1; margin: 0 auto">
            <img
              src="https://res.cloudinary.com/dgtbm9skf/image/upload/v1720713077/Logo-Healthy_1_aqzchm.png"
              style="width: 150px; height: auto;"
              alt="Healthy App"
            />
             
          </div>
      `;

      return sendEmail(userEmail, subject, text, html).then(() => {
        console.log("**********El email ha sido enviado");

        res.json({
          createdRecipes,
        });
      });
    })
    .catch((error) => {
      console.error("Error creating recipe:", error);
      res.status(500).send({ error: "Something went wrong" });
    });
};
