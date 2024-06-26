const Recipe = require("../models/Recipe.model");

module.exports.listRecipes = (req, res, next) => {
  Recipe.find()
    .then((recipes) => {
      res.json(recipes);
    })
    .catch(next);
};

module.exports.recipeDetails = (req, res, next) => {
  const { id } = req.params;

  Recipe.finById(id)
    .then((recipe) => {
      console.log("object", recipe);
      res.json(recipe);
    })
    .catch(next);
};
