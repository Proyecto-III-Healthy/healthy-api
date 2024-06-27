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

  Recipe.findById(id)
    .then((recipe) => {
      res.json(recipe);
    })
    .catch(next);
};
