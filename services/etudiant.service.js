let Etudiant = require("../model/etudiant");

// Récupérer l'etudiant connecté (GET)
function getEtudiantConnected(req, res) {
  let etudiantId = req.etudiant._id;
  Etudiant.findById(etudiantId, (err, etudiant) => {
    if (err) {
      return res.status(500).send({
        message: "Erreur lors de la récupération de la etudiant",
        error: err,
      });
    }
    if (!etudiant) {
      return res.status(404).send({ message: "Etudiant non trouvé" });
    }
    res.status(200).json(etudiant);
  });
}

module.exports = {
  getEtudiantConnected,
};
