const router = require("express").Router();

const { create, getCurrentUser } = require("./../controllers/user.controller");
const { login } = require("./../controllers/auth.controller");
const { isAuthenticated } = require("./../middlewares/auth.middleware");
const { getRecipes } = require("./../controllers/chat.controller");
const { listRecepies } = require("./../controllers/recepies.controller");

// Auth
router.post("/login", login);

//User routes
router.post("/register", create);
router.get("/users/me", isAuthenticated, getCurrentUser);

//Chat gpt
router.post("/chat", getRecipes);

//Recepies
router.get("/recepies", listRecepies);

module.exports = router;
