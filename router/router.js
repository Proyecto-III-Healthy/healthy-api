const router = require("express").Router();

const { 
    create
} = require("./../controllers/user.controller")

//User routes
router.post("/register", create)

module.exports = router;