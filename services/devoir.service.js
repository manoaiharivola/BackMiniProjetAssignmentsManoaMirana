let Devoir = require("../model/devoir");
let DevoirEtudiantService = require("./devoir_etudiant.service");
let Matiere = require("../model/matiere");
let mongoose = require("mongoose");
let ObjectId = mongoose.Types.ObjectId;
const DevoirEtudiant = require("../model/devoir_etudiant");
const Etudiant = require("../model/etudiant");

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
          dateDeCreation: devoir.dateDeCreation,
          dateDeRendu: devoir.dateDeRendu,
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
      dateDeCreation: new Date(),
      dateDeRendu: req.body.dateDeRendu,
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
      res.status(500).json({ error: "Erreur serveur :" + error });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du devoir :", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: "Erreur serveur :" + error });
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


// Récupérer les devoirs par professeur connecté (GET)
function getDevoirsParProfesseur(req, res) {
  const professeurId = req.professeur._id;
  const matiereFilter = req.query.matiere_id ? { "matiere._id": ObjectId(req.query.matiere_id) } : {};

  let aggregateQuery = Devoir.aggregate([
    {
      $lookup: {
        from: "matieres",
        localField: "matiere_id",
        foreignField: "_id",
        as: "matiere"
      }
    },
    {
      $unwind: "$matiere"
    },
    {
      $lookup: {
        from: "professeurs",
        localField: "matiere.professeur_id",
        foreignField: "_id",
        as: "professeur"
      }
    },
    {
      $unwind: "$professeur"
    },
    {
      $match: {
        "professeur._id": ObjectId(professeurId),
        ...matiereFilter
      }
    },
    {
      $project: {
        _id: 1,
        nom: 1,
        description: 1,
        dateDeCreation: 1,
        dateDeRendu: 1,
        matiere_id: 1,
        "matiere._id": 1,
        "matiere.nom": 1,
        "matiere.etudiant_inscrits": 1,
        "matiere.professeur_id": {
          _id: "$professeur._id",
          nom: "$professeur.nom",
          prenom: "$professeur.prenom",
          mail: "$professeur.mail",
          professeur_connexion_id: "$professeur.professeur_connexion_id",
          __v: "$professeur.__v"
        },
        __v: "$matiere.__v"
      }
    }
  ]);

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
          dateDeCreation: devoir.dateDeCreation,
          dateDeRendu: devoir.dateDeRendu,
          matiere_id: {
            _id: devoir.matiere._id,
            etudiant_inscrits: devoir.matiere.etudiant_inscrits,
            nom: devoir.matiere.nom,
            professeur_id: {
              _id: devoir.matiere.professeur_id._id,
              nom: devoir.matiere.professeur_id.nom,
              prenom: devoir.matiere.professeur_id.prenom,
              mail: devoir.matiere.professeur_id.mail,
              professeur_connexion_id: devoir.matiere.professeur_id.professeur_connexion_id,
              __v: devoir.matiere.professeur_id.__v
            },
            __v: devoir.matiere.__v
          },
          __v: devoir.__v
        };
      });

      res.json(data);
    }
  );
}

// Récupérer les devoirs rendus par les étudiants (GET)
async function getDevoirsRendusParEtudiants(req, res) {
  try {
    const devoirId = req.params.id;

    // Rechercher les devoirs étudiants où rendu est vrai
    const devoirsEtudiants = await DevoirEtudiant.find({ devoir_id: ObjectId(devoirId), dateLivraison: { $ne: null } }).populate('etudiant_id');

    const nonNotes = [];
    const notes = [];

    devoirsEtudiants.forEach((devoirEtudiant) => {
      const etudiantInfo = {
        _id: devoirEtudiant.etudiant_id._id,
        nom: devoirEtudiant.etudiant_id.nom,
        prenom: devoirEtudiant.etudiant_id.prenom,
        mail: devoirEtudiant.etudiant_id.mail,
      };

      const result = {
        _id: devoirEtudiant._id,
        note: devoirEtudiant.note,
        remarques_note: devoirEtudiant.remarques_note,
        dateLivraison: devoirEtudiant.dateLivraison,
        dateNotation: devoirEtudiant.dateNotation, 
        devoir_id: devoirEtudiant.devoir_id,
        etudiant_id: etudiantInfo,
      };

      if (devoirEtudiant.note === null) {
        nonNotes.push(result);
      } else {
        notes.push(result);
      }
    });

    // Trier les résultats
    nonNotes.sort((a, b) => new Date(a.dateLivraison) - new Date(b.dateLivraison));
    notes.sort((a, b) => new Date(b.dateNotation) - new Date(a.dateNotation));

    res.status(200).json({ nonNotes, notes });
  } catch (error) {
    console.error('Erreur lors de la récupération des devoirs étudiants :', error);
    res.status(500).json({ error: 'Erreur serveur : ' + error });
  }
}


module.exports = {
  getDevoirs,
  postDevoir,
  getDevoir,
  updateDevoir,
  deleteDevoir,
  getDevoirsParProfesseur,
  getDevoirsRendusParEtudiants,
};