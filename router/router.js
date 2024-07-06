const router = require("express").Router();

const { create, getCurrentUser } = require("./../controllers/user.controller");
const { login } = require("./../controllers/auth.controller");
const { isAuthenticated } = require("./../middlewares/auth.middleware");
const { getRecipes } = require("./../controllers/chat.controller");
const {
  listRecipes,
  recipeDetails,
  toggleFavorite,
  listFavorites,
} = require("../controllers/recipe.controller");
const { uploadImageToCloudinary } = require("../controllers/cloudinary.controller");
const Recipe = require("../models/Recipe.model");
const { sendEmail } = require('./../config/nodemailer.config'); // Importar el servicio de email

//const recipeController = require("./../controllers/recipe.controller");

// Auth
router.post("/login", login);

//User routes
router.post("/register", create);
router.get("/users/me", isAuthenticated, getCurrentUser);

//Chat gpt
router.post("/chat", isAuthenticated, getRecipes, uploadImageToCloudinary, (req, res) => {
  const { recipes } = req.body;
  Recipe.insertMany(recipes)
    .then((createdRecipes) => {

      const userEmail = req.user.email; // Asegúrate de que el email del usuario esté disponible
      const subject = "Tus recetas solicitadas";
      const text = "Aquí tienes las recetas que solicitaste:";
      const html = `
        <h1>Tus recetas solicitadas</h1>
        <ul>
          ${createdRecipes
            .map(
              (recipe) =>
                `
            <div
            className="card mb-3 mt-5"
            style="max-width: 540px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 16px;"
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
                  <a href="${process.env.FRONTEND_URL}/recipes/${recipe._id}" style="color: #007bff; text-decoration: none;">Ver detalles</a>
                </div>
              </div>
            </div>
          </div>
        `).join("")}
      `;

      return sendEmail(userEmail, subject, text, html).then(() => {
        console.log("**********El email ha sido enviado")
        
        res.json({
          createdRecipes,
        });
      })
    })
    .catch((error) => {
      console.error("Error creating recipe:", error);
      res.status(500).send({ error: "Something went wrong" });
    });
});

//Recipe
router.get("/recipes", listRecipes);
router.get("/recipes/favorites", listFavorites);
router.get("/recipes/:id", recipeDetails);
router.put('/recipes/:id/favorite', toggleFavorite);


module.exports = router;
