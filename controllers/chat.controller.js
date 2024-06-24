const axios = require("axios");
module.exports.getRecipes = (req, res, next) => {
  const ingredients = req.body.ingredients;
  console.log(ingredients);
  if (!ingredients) {
    return res.status(400).send({ error: "Los ingredientes necesarios" });
  }

  const prompt = `Quiero una receta que use estos ingredientes ${ingredients.join(
    ", "
  )}, envialo en formato html, seprando titulos, listas, enlaces... etc`;

  axios
    .post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      Recipe.create();
      res.json(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 429) {
        // Handle rate limit error
        console.error("Rate limit exceeded:", error.response.data);
        res
          .status(429)
          .send({ error: "Rate limit exceeded. Please try again later." });
      } else {
        // Handle other errors
        console.error("Error:", error);
        //res.status(500).send({ error: "Something went wrong" });
      }
    });
  //res.json(prompt)
};
