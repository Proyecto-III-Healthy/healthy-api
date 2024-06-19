const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ROUNDS = 10;

const EMAIL_PATTERN =
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "required field"],
      match: [EMAIL_PATTERN, "invalid email pattern"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "required field"],
      minlength: [8, "invalid length"],
    },
    gender: {
      type: String,
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Sirve para cambiar el output de los endpoints cuando hago res.json
        delete ret.__v;
      },
    },
  }
);

UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt
      .hash(this.password, ROUNDS)
      .then((hash) => {
        this.password = hash;
        next();
      })
      .catch(next);
    // .catch(err => next(err))
  } else {
    next();
  }
});

UserSchema.methods.checkPassword = function (passwordToCompare) {
  return bcrypt.compare(passwordToCompare, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;