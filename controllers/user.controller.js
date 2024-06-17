const User = require("./../models/User.model")
module.exports.create = (req, res, next) => {
  const { email, password } = req.body;

  User.create({ email, password })
    .then((userCreated) => {
      res.status(204).json(userCreated);
    })
    .catch(next);
};
