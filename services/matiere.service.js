let Matiere = require("../model/matiere");
let mongoose = require("mongoose");
let ObjectId = mongoose.Types.ObjectId;
const Etudiant = require("../model/etudiant");

// Récupérer tous les matieres (GET)
function getMatieres(req, res) {
  let aggregateQuery = Matiere.aggregate();

  Matiere.aggregatePaginate(
    aggregateQuery,
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    },
    (err, data) => {
      if (err) {
        return res.status(500).send({
          message: "Erreur lors de la récupération des matières",
          error: err,
        });
      }
      res.status(200).send(data);
    }
  );
}

function getProfesseurMatieres(req, res) {
  const professeurId = req.professeur._id;

  let aggregateQuery = Matiere.aggregate([
    { $match: { professeur_id: ObjectId(professeurId) } },
  ]);

  Matiere.aggregatePaginate(
    aggregateQuery,
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    },
    (err, data) => {
      if (err) {
        return res.status(500).send({
          message: "Erreur lors de la récupération des matières",
          error: err,
        });
      }
      res.status(200).send(data);
    }
  );
}

// Récupérer un matiere par son id (GET)
function getMatiere(req, res) {
  let matiereId = req.params.id;
  Matiere.findById(matiereId, (err, matiere) => {
    if (err) {
      return res.status(500).send({
        message: "Erreur lors de la récupération de la matière",
        error: err,
      });
    }
    if (!matiere) {
      return res.status(404).send({ message: "Matière non trouvée" });
    }
    res.status(200).json(matiere);
  });
}

// Ajout d'un matiere (POST)
function postMatiere(req, res) {
  let matiere = new Matiere();
  if(req.file){
    matiere.photo = req.file.path;
  }
  Matiere.findOne({ nom: req.body.nom }, (err, existingMatiere) => {
    if (err) {
      return res.status(500).send({
        message: "Erreur lors de la vérification de la matière",
        error: err,
      });
    }
    if (existingMatiere) {
      return res
        .status(400)
        .send({ message: "Le nom de la matière existe déjà" });
    }

    matiere.nom = req.body.nom;
    matiere.professeur_id = req.professeur._id;
    matiere.etudiant_inscrits = [];

    console.log("POST matière reçu :");

    matiere.save((err) => {
      if (err) {
        return res.status(500).send({
          message: "Erreur lors de l'enregistrement de la matière",
          error: err,
        });
      }
      res.status(201).json({ message: `${matiere.nom} sauvegardée !` });
    });
  });
}

// Update d'un matiere (PUT)
function updateMatiere(req, res) {
  console.log("UPDATE reçu matière : ");
  console.log(req.body);

  Matiere.findOne({ nom: req.body.nom }, (err, existingMatiere) => {
    if (err) {
      return res.status(500).send({
        message: "Erreur lors de la vérification de la matière",
        error: err,
      });
    }
    if (existingMatiere && existingMatiere._id.toString() !== req.body._id) {
      return res
        .status(400)
        .send({ message: "Le nom de la matière existe déjà" });
    }

    // Récupérer la matière existante pour conserver professeur_id et vérifier les changements
    Matiere.findById(req.body._id, (err, matiere) => {
      if (err) {
        return res.status(500).send({
          message: "Erreur lors de la récupération de la matière existante",
          error: err,
        });
      }
      if (!matiere) {
        return res.status(404).send({ message: "Matière non trouvée" });
      }

      // Conserver professeur_id existant si non fourni
      if (!req.body.professeur_id) {
        req.body.professeur_id = matiere.professeur_id;
      } else {
        req.body.professeur_id = ObjectId(req.body.professeur_id);
      }

      // Vérifier si quelque chose a changé
      const updates = {
        nom: req.body.nom,
        professeur_id: req.body.professeur_id,
      };

      if (
        updates.nom === matiere.nom &&
        updates.professeur_id.toString() === matiere.professeur_id.toString()
      ) {
        return res.status(400).send({ message: "Aucun changement détecté" });
      }

      // Effectuer la mise à jour si des changements sont détectés
      Matiere.findByIdAndUpdate(
        req.body._id,
        updates,
        { new: true },
        (err, updatedMatiere) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              message: "Erreur lors de la mise à jour de la matière",
              error: err,
            });
          }
          res
            .status(200)
            .json({ message: "Matière mise à jour", matiere: updatedMatiere });
        }
      );
    });
  });
}

// suppression d'un matiere (DELETE)
function deleteMatiere(req, res) {
  Matiere.findByIdAndRemove(req.params.id, (err, matiere) => {
    if (err) {
      return res.status(500).send({
        message: "Erreur lors de la suppression de la matière",
        error: err,
      });
    }
    if (!matiere) {
      return res.status(404).send({ message: "Matière non trouvée" });
    }
    res.status(200).json({ message: `${matiere.nom} supprimée` });
  });
}

// Ajouter des etudiants à une matière spécifique
async function ajouterEtudiants(req, res) {
  try {
    const matiereId = req.params.id;
    const etudiants = req.body.etudiants;
    const matiere = await Matiere.findById(matiereId);
    if (!matiere) {
      return res.status(404).json({ message: "Matière non trouvée" });
    }

    // Réinitialiser la liste des etudiants inscrits
    matiere.etudiant_inscrits = [];

    // Ajouter les etudiants à la matière
    matiere.etudiant_inscrits.push(...etudiants);
    await matiere.save();
    res
      .status(201)
      .json({ message: "Etudiants ajoutés avec succès à la matière" });
  } catch (error) {
    console.error("Erreur lors de l'ajout des etudiants à la matière :", error);
    res.status(500).json({
      message: "Erreur lors de l'ajout des etudiants à la matière",
      error: error,
    });
  }
}

// Fonction pour lister les étudiants d'une matière
async function getEtudiantsParMatiere(req, res) {
  try {
    const matiereId = req.params.id;
    const { sortBy = "mail", order = "asc" } = req.query; // Valeurs par défaut : mail et asc

    // Trouver la matière pour obtenir les étudiants inscrits
    const matiere = await Matiere.findById(matiereId).populate(
      "etudiant_inscrits"
    );
    if (!matiere) {
      return res.status(404).json({ message: "Matière non trouvée" });
    }

    // Récupérer tous les étudiants
    const tousLesEtudiants = await Etudiant.find();

    // Ajouter le statut d'inscription pour chaque étudiant
    let etudiantsAvecStatut = tousLesEtudiants.map((etudiant) => {
      const estInscrit = matiere.etudiant_inscrits.some((inscrit) =>
        inscrit._id.equals(etudiant._id)
      );
      return {
        ...etudiant.toObject(),
        inscrit: estInscrit,
      };
    });

    // Tri des étudiants
    etudiantsAvecStatut.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return order === "asc" ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return order === "asc" ? 1 : -1;
      return 0;
    });

    res.status(200).json(etudiantsAvecStatut);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants avec statut :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des étudiants avec statut",
      error: error,
    });
  }
}

module.exports = {
  getMatieres,
  postMatiere,
  getMatiere,
  updateMatiere,
  deleteMatiere,
  ajouterEtudiants,
  getEtudiantsParMatiere,
  getProfesseurMatieres,
};
