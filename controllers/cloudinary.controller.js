const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const createError = require("http-errors");

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports.uploadImageToCloudinary = (req, res, next) => {
  const { recipeObj } = req.body;

  if (!recipeObj || !recipeObj.urlImage) {
    return next(createError(400, "No image URL found in the recipe object"));
  }

  axios({
    url: recipeObj.urlImage,
    responseType: 'stream',
  })
    .then(response => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'recipe_images' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        response.data.pipe(uploadStream);
      });
    })
    .then((secureUrl) => {
      req.body.recipeObj.urlImage = secureUrl;
      next();
    })
    .catch(error => {
      console.error("Error uploading image to Cloudinary:", error);
      next(createError(500, "Error uploading image to Cloudinary"));
    });
};
