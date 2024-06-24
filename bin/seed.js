const mongoose = require("mongoose");
const Recepi = require("./../models/Recepi.model");
const recepies = require("./recepies.json")
require('../config/db.config');

mongoose.connection.once('open', () => {
  mongoose.connection.dropCollection('recepies')
    .then(() => {
      console.log('Collection dropped');
      return Recepi.create(recepies);
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