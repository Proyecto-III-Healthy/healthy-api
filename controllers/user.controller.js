const User = require("./../models/User.model");
const createError = require("http-errors");
const { uploadToCloudinary } = require("./../controllers/cloudinary.controller");

module.exports.create = (req, res, next) => {
  const {
    name,
    email,
    password,
    gender,
    weight,
    height,
    objetive,
    ability,
    typeDiet,
    alergic,
  } = req.body;

  User.create({
    name,
    email,
    password,
    gender,
    weight,
    height,
    objetive,
    ability,
    typeDiet,
    alergic,
  })
    .then((userCreated) => {
      res.status(201).json(userCreated);
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.currentUserId)
    .then((user) => {
      if (!user) {
        next(createError(404, "User not found"));
      } else {
        res.json(user);
      }
    })
    .catch(next);
};

module.exports.update = (req, res, next) => {
  const updateData = { ...req.body };

  if (req.file) {
    uploadToCloudinary(req.file.path)
      .then((result) => {
        updateData.avatarUrl = result.secure_url;
        return User.findByIdAndUpdate(req.params.id, updateData, { new: true });
      })
      .then((editedUser) => {
        res.json(editedUser);
      })
      .catch(next);
  } else {
    User.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .then((editedUser) => {
        res.json(editedUser);
      })
      .catch(next);
  }
};

module.exports.delete = (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => {
      res.send("User deleted");
    })
    .catch(next);
};

module.exports.uploadAvatar = (req, res, next) => {
  if (!req.file) {
    return next(createError(400, "No file uploaded"));
  }

  uploadToCloudinary(req.file.path)
    .then((result) => {
      return User.findByIdAndUpdate(req.currentUserId, { avatarUrl: result.secure_url }, { new: true });
    })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch(next);
};
