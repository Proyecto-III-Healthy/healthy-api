module.exports.getRecipes = (req, res, next) => {
    const prompt = req.body.prompt;
    res.json(prompt)
}