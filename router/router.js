const router = require("express").Router();

const { create, getCurrentUser } = require("./../controllers/user.controller");
const { login } = require("./../controllers/auth.controller");
const { isAuthenticated } = require("./../middlewares/auth.middleware");

// Auth
router.post("/login", login);

//User routes
router.post("/register", create);
router.get("/users/me", isAuthenticated, getCurrentUser);

module.exports = router;
