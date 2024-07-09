const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });

const {
  create,
  getCurrentUser,
  update,
  delete: deleteUser,
  uploadAvatar
} = require("./../controllers/user.controller");

const { login } = require("./../controllers/auth.controller");
const { isAuthenticated } = require("./../middlewares/auth.middleware");
const { getRecipes, saveRecipes } = require("./../controllers/chat.controller");
const { generateDaylyMealPlan } = require("./../controllers/meals.controller");
const {
  listRecipes,
  recipeDetails,
  toggleFavorite,
  listFavorites
} = require("../controllers/recipe.controller");
const { uploadImageToCloudinary } = require("../controllers/cloudinary.controller");

// Auth
router.post("/login", login);

// User routes
router.post("/register", create);
router.get("/users/me", isAuthenticated, getCurrentUser);

router.put("/user/:id", isAuthenticated, update);
router.delete("/user/:id", isAuthenticated, deleteUser);
router.post("/user/upload-avatar", isAuthenticated, upload.single("avatar"), uploadAvatar);

// Chat GPT
router.post("/chat", isAuthenticated, getRecipes, uploadImageToCloudinary, saveRecipes);
router.post("/dayPlan", isAuthenticated, generateDaylyMealPlan);

// Recipe
router.get("/recipes", listRecipes);
router.get("/recipes/favorites", listFavorites);
router.get("/recipes/:id", recipeDetails);
router.put('/recipes/:id/favorite', toggleFavorite);

module.exports = router;
