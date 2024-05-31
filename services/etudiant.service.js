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

// Récupérer la liste des étudiants avec pagination (GET)
async function getListeEtudiants(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const totalDocs = await Etudiant.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);
    const pagingCounter = (page - 1) * limit + 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const docs = await Etudiant.find()
      .select('nom prenom mail')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      docs,
      totalDocs,
      limit,
      page,
      totalPages,
      pagingCounter,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des étudiants :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}


module.exports = {
  getEtudiantConnected,
  getListeEtudiants,
};
