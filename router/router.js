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
//const recipeController = require("./../controllers/recipe.controller");

// Auth
router.post("/login", login);

//User routes
router.post("/register", create);
router.get("/users/me", isAuthenticated, getCurrentUser);

//Chat gpt
router.post("/chat", isAuthenticated, getRecipes, uploadImageToCloudinary, (req, res) => {
  const { recipeObj } = req.body;
  Recipe.create(recipeObj)
    .then((createdRecipe) => {
      res.json({
        createdRecipe,
      });
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
