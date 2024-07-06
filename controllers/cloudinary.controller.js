const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const createError = require("http-errors");

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports.uploadImageToCloudinary = (req, res, next) => {
  const { recipes } = req.body;

  if (!recipes || recipes.length === 0) {
    return next(createError(400, "No image URL found in the recipe object"));
  }
  const uploadPromises = recipes.map((recipe) => {
    if (!recipe.urlImage) {
      return Promise.resolve(recipe);
    }
    return axios({
      url: recipe.urlImage,
      responseType: "stream",
    })
      .then((response) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "recipe_images" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                recipe.urlImage = result.secure_url;
                resolve(recipe);
              }
            }
          );
          response.data.pipe(uploadStream);
        });
      })
      .catch((error) => {
        console.error("Error uploading image to Cloudinary:", error);
        return recipe;
      });
  });
  Promise.all(uploadPromises)
    .then((recipesWithCloudinaryUrls) => {
      req.body.recipes = recipesWithCloudinaryUrls;
      next();
    })
    .catch((error) => {
      console.error("Error uploading image to Cloudinary:", error);
      next(createError(500, "Error uploading image to Cloudinary"));
    });
};
