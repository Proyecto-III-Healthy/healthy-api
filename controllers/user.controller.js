const User = require("./../models/User.model");
module.exports.create = (req, res, next) => {
  const { email, password, gender } = req.body;

  User.create({ email, password, gender })
    .then((userCreated) => {
      res.status(204).json(userCreated);
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.currentUserId)
    .then((user) => {
      if (!user) {
        next(createError(402, "User not found"));
      } else {
        res.json(user);
      }
    })
    .catch(next);
};
