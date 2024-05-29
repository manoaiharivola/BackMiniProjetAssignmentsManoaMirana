let Professeur = require("../model/professeur");

// Récupérer l'professeur connecté (GET)
function getProfesseurConnected(req, res) {
  let professeurId = req.professeur._id;
  Professeur.findById(professeurId, (err, professeur) => {
    if (err) {
      return res.status(500).send({
        message: "Erreur lors de la récupération de la professeur",
        error: err,
      });
    }
    if (!professeur) {
      return res.status(404).send({ message: "Professeur non trouvé" });
    }
    res.status(200).json(professeur);
  });
}

module.exports = {
  getProfesseurConnected,
};
