const mongoose = require("mongoose");
const Recipe = require("./../models/Recipe.model");
const recipes = require("./recipes.json")
require('../config/db.config');

mongoose.connection.once('open', () => {
  mongoose.connection.dropCollection('recipes')
    .then(() => {
      console.log('Collection dropped');
      return Recipe.create(recipes);
    })
    .then(() => {
      console.log('Collection created');
      mongoose.connection.close();
    })
    .catch(err => console.error(err))
    .finally(() => {
      mongoose.connection.close()
      .then(() => {
        console.log('End of seeds');
      })
      .catch((err) => console.error('Error while disconnecting', err))
      .finally(() => process.exit(0))
    });
});