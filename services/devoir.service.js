let Devoir = require("../model/devoir");
let DevoirEtudiantService = require("./devoir_etudiant.service");
// Récupérer tous les devoirs (GET)
function getDevoirs(req, res) {
  let aggregateQuery = Devoir.aggregate()
    .lookup({
      from: "matieres",
      localField: "matiere_id",
      foreignField: "_id",
      as: "matiere",
    })
    .lookup({
      from: "professeurs",
      localField: "matiere.professeur_id",
      foreignField: "_id",
      as: "professeur",
    });

  Devoir.aggregatePaginate(
    aggregateQuery,
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    },
    (err, data) => {
      if (err) {
        console.error("Erreur lors de la récupération des devoirs :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      // Remplacer chaque élément de la liste avec les détails de la matière et du professeur
      data.docs = data.docs.map((devoir) => {
        return {
          _id: devoir._id,
          nom: devoir.nom,
          description: devoir.description,
          dateDeRendu: devoir.dateDeRendu,
          rendu: devoir.rendu,
          matiere_id: {
            _id: devoir.matiere[0]._id,
            etudiant_inscrits: devoir.matiere[0].etudiant_inscrits,
            nom: devoir.matiere[0].nom,
            professeur_id: {
              _id: devoir.professeur[0]._id,
              nom: devoir.professeur[0].nom,
              prenom: devoir.professeur[0].prenom,
              mail: devoir.professeur[0].mail,
              professeur_connexion_id:
                devoir.professeur[0].professeur_connexion_id,
              __v: devoir.professeur[0].__v,
            },
            __v: devoir.matiere[0].__v,
          },
          __v: devoir.__v,
        };
      });

      res.json(data);
    }
  );
}

// Récupérer un devoir par son id (GET)
function getDevoir(req, res) {
  let devoirId = req.params.id;
  Devoir.findById(devoirId)
    .populate({
      path: "matiere_id",
      populate: { path: "professeur_id" },
    })
    .exec((err, devoir) => {
      if (err) {
        console.error("Erreur lors de la récupération du devoir :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (!devoir) {
        return res.status(404).json({ error: "Devoir non trouvé" });
      }
      res.json(devoir);
    });
}

async function postDevoir(req, res) {
  const session = await Devoir.startSession();
  session.startTransaction();

  try {
    let devoir = new Devoir({
      nom: req.body.nom,
      description: req.body.description,
      dateDeRendu: req.body.dateDeRendu,
      rendu: req.body.rendu,
      matiere_id: req.body.matiere_id,
    });

    console.log("POST devoir reçu :");
    console.log(devoir);

    const existingDevoir = await Devoir.findOne({ nom: req.body.nom }).session(
      session
    );
    if (existingDevoir) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Un devoir avec ce nom existe déjà." });
    }

    const savedDevoir = await devoir.save({ session });

    try {
      const response = await DevoirEtudiantService.creerDevoirsEtudiants(
        savedDevoir._id,
        savedDevoir.matiere_id,
        session
      );
      await session.commitTransaction();
      session.endSession();
      res.json({
        message: `${savedDevoir.nom} enregistré et distribué aux étudiants!`,
        response,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la distribution du devoir aux étudiants :",
        error
      );
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ error: "Erreur serveur" });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du devoir :", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Update d'un devoir (PUT)
function updateDevoir(req, res) {
  console.log("UPDATE reçu devoir : ");
  console.log(req.body);
  Devoir.findByIdAndUpdate(
    req.body._id,
    req.body,
    { new: true },
    (err, devoir) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du devoir :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (!devoir) {
        return res.status(404).json({ error: "Devoir non trouvé" });
      }
      res.json({ message: "Mise à jour effectuée" });
    }
  );
}

// suppression d'un devoir (DELETE)
function deleteDevoir(req, res) {
  Devoir.findByIdAndRemove(req.params.id, (err, devoir) => {
    if (err) {
      console.error("Erreur lors de la suppression du devoir :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (!devoir) {
      return res.status(404).json({ error: "Devoir non trouvé" });
    }
    res.json({ message: `${devoir.nom} supprimé` });
  });
}

module.exports = {
  getDevoirs,
  postDevoir,
  getDevoir,
  updateDevoir,
  deleteDevoir,
};
