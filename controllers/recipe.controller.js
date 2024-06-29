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
module.exports.toggleFavorite = async (req, res, next) => {
  const { id } = req.params;

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    recipe.isFavorite = !recipe.isFavorite;
    await recipe.save();

    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};
module.exports.listFavorites = (req, res, next) => {
  Recipe.find({isFavorite: true})
    .then((recipes) => {
      res.json(recipes);
    })
    .catch(next);
};