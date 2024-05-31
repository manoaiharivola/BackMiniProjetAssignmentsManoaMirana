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

// Récupérer les professeurs paginés (GET)
async function getListeProfesseurs(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const totalDocs = await Professeur.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);
    const pagingCounter = (page - 1) * limit + 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const docs = await Professeur.find()
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
    console.error("Erreur lors de la récupération des professeurs :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getProfesseurConnected,
  getListeProfesseurs
};
