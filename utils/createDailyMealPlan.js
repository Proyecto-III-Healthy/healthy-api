const DayPlan = require("../models/DayPlan.model");
const WeeklyMealPlan = require("../models/WeeklyPlan.model");
const Meal = require("../models/Meal.model");
const Recipe = require("../models/Recipe.model");
const dayjs = require("dayjs");
const cloudinary = require("../config/cloudinary.config");
const axios = require("axios");

// Function to pause execution for a specified duration (in milliseconds)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createDailyMealPlan = async (startDate, mealsByDay) => {
  const days = [];

  //Crea una función que tendra como paramaetro un obj receta
  const generateImageAndUpload = (recipe) => {
    // Generate image using DALL-E
    const dallePrompt = `Crea una imagen para una receta llamada ${recipe.name}`;
    return axios
      .post(
        "https://api.openai.com/v1/images/generations",
        {
          prompt: dallePrompt,
          n: 1,
          size: "512x512",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((dalleResponse) => {
        const imageUrl = dalleResponse.data.data[0].url;

        // Download image to a local path or buffer
        return axios.get(imageUrl, { responseType: "arraybuffer" });
      })
      .then((imageResponse) => {
        const imageBuffer = Buffer.from(imageResponse.data, "binary");

        // Upload image to Cloudinary
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "image" }, (error, result) => {
              if (error) {
                console.error("Error uploading to Cloudinary:", error);
                reject(new Error("Error uploading to Cloudinary"));
              } else {
                resolve(result.secure_url);
              }
            })
            .end(imageBuffer);
        });
      })
      .catch((error) => {
        console.error("Error generating or uploading image:", error);
        if (error.response && error.response.status === 429) {
          console.log("Rate limit exceeded, waiting before retrying...");
          return sleep(11000).then(() => generateImageAndUpload(recipe));
        }
        throw error;
      });
  };

  const date = new Date(startDate);
  const mealsPromise = mealsByDay.map((meal) => {

        return generateImageAndUpload(meal.recipe)
          .then((imageUrl) => {
            // Create the recipe with the image URL from Cloudinary
            const recipe = new Recipe({ ...meal.recipe, urlImage: imageUrl });
            return recipe.save();
          })
          .then((recipeDB) => {
            //antes de crear la meal, creo la receta y el id se lo paso al new Meal
            const newMeal = new Meal({ ...meal, recipe: recipeDB._id, type: meal.type});
            return newMeal.save().then(() => ({
              meal: newMeal._id,
              time: meal.time,
            }));
          });
      })

  const savedMeals = await Promise.all(mealsPromise);
  //{ date, meals: savedMeals, user: req.currentuser}
  const dayPlan = { date, meals: savedMeals};
  const newDayPlan = new DayPlan(dayPlan);
  return newDayPlan.save();
};

module.exports = createDailyMealPlan;
