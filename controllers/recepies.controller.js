const Recepi = require("./../models/Recepi.model");
module.exports.listRecepies = (req, res, next) => {
    Recepi.find()
        .then(recepies => {
            
            res.json(recepies)
        })
        .catch(next)
}