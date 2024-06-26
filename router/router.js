const router = require("express").Router();

const { create, getCurrentUser } = require("./../controllers/user.controller");
const { login } = require("./../controllers/auth.controller");
const { isAuthenticated } = require("./../middlewares/auth.middleware");
const { getRecipes } = require("./../controllers/chat.controller");
const {
  listRecipes,
  recipeDetails,
} = require("../controllers/recipe.controller");
//const recipeController = require("./../controllers/recipe.controller");

// Auth
router.post("/login", login);

//User routes
router.post("/register", create);
router.get("/users/me", isAuthenticated, getCurrentUser);

//Chat gpt
router.post("/chat", getRecipes);

//Recipe
router.get("/recipes", listRecipes);
router.get("/recipes/:id", recipeDetails);

module.exports = router;
