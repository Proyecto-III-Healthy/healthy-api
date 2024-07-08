const router = require("express").Router();

const { create, getCurrentUser } = require("./../controllers/user.controller");
const { login } = require("./../controllers/auth.controller");
const { isAuthenticated } = require("./../middlewares/auth.middleware");
const { getRecipes, saveRecipes } = require("./../controllers/chat.controller");
const  {generateDaylyMealPlan } = require("./../controllers/meals.controller");
const {
  listRecipes,
  recipeDetails,
  toggleFavorite,
  listFavorites,
} = require("../controllers/recipe.controller");
const { uploadImageToCloudinary } = require("../controllers/cloudinary.controller");


//const recipeController = require("./../controllers/recipe.controller");

// Auth
router.post("/login", login);

//User routes
router.post("/register", create);
router.get("/users/me", isAuthenticated, getCurrentUser);

//Chat gpt
router.post("/chat", isAuthenticated, getRecipes, uploadImageToCloudinary, saveRecipes);
router.post("/dayPlan", isAuthenticated, generateDaylyMealPlan);

//Recipe
router.get("/recipes", listRecipes);
router.get("/recipes/favorites", listFavorites);
router.get("/recipes/:id", recipeDetails);
router.put('/recipes/:id/favorite', toggleFavorite);


module.exports = router;
