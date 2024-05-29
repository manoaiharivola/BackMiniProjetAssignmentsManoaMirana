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
async function updateDevoir(req, res) {
  console.log("UPDATE reçu devoir : ");
  console.log(req.body);

  const { _id, nom, description, dateDeRendu, matiere_id } = req.body;

  try {
    // Vérifier si le devoir existe
    const devoir = await Devoir.findById(_id);
    if (!devoir) {
      return res.status(404).json({ error: "Devoir non trouvé" });
    }

    // Vérifier si le titre existe déjà pour un autre devoir
    const existingDevoir = await Devoir.findOne({ nom, _id: { $ne: _id } });
    if (existingDevoir) {
      return res.status(400).json({ error: "Un devoir avec ce titre existe déjà." });
    }

    // Vérifier si la date limite est dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateRendu = new Date(dateDeRendu);
    if (dateDeRendu && dateRendu < today) {
      return res.status(400).json({ error: "La date limite ne peut pas être une date passée." });
    }

    // Construire l'objet de mise à jour
    const updateFields = {};
    if (nom) updateFields.nom = nom;
    if (description !== undefined) updateFields.description = description; // Si description est explicitement envoyée comme null, undefined, etc.
    if (dateDeRendu) updateFields.dateDeRendu = dateDeRendu;

    // Mettre à jour le devoir
    const updatedDevoir = await Devoir.findByIdAndUpdate(_id, updateFields, { new: true });
    res.json({ message: "Mise à jour effectuée", devoir: updatedDevoir });

  } catch (err) {
    console.error("Erreur lors de la mise à jour du devoir :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = {
  updateDevoir
};


// suppression d'un devoir (DELETE)
async function deleteDevoir(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const devoirId = req.params.id;

    // Supprimer les devoirs des étudiants
    const resultDevoirEtudiant = await DevoirEtudiant.deleteMany({ devoir_id: devoirId }).session(session);
    console.log(`Nombre de devoirs des étudiants supprimés : ${resultDevoirEtudiant.deletedCount}`);

    // Supprimer le devoir principal
    const resultDevoir = await Devoir.findByIdAndRemove(devoirId).session(session);
    if (!resultDevoir) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Devoir non trouvé" });
    }

    await session.commitTransaction();
    session.endSession();
    res.json({ message: `${resultDevoir.nom} et tous les devoirs associés des étudiants ont été supprimés` });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erreur lors de la suppression du devoir :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Récupérer les devoirs par professeur connecté (GET)
function getDevoirsParProfesseur(req, res) {
  const professeurId = req.professeur._id;
  const matiereFilter = req.query.matiere_id
    ? { "matiere._id": ObjectId(req.query.matiere_id) }
    : {};

  let aggregateQuery = Devoir.aggregate([
    {
      $lookup: {
        from: "matieres",
        localField: "matiere_id",
        foreignField: "_id",
        as: "matiere",
      },
    },
    {
      $unwind: "$matiere",
    },
    {
      $lookup: {
        from: "professeurs",
        localField: "matiere.professeur_id",
        foreignField: "_id",
        as: "professeur",
      },
    },
    {
      $unwind: "$professeur",
    },
    {
      $match: {
        "professeur._id": ObjectId(professeurId),
        ...matiereFilter,
      },
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
          __v: "$professeur.__v",
        },
        __v: "$matiere.__v",
      },
    },
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
              professeur_connexion_id:
                devoir.matiere.professeur_id.professeur_connexion_id,
              __v: devoir.matiere.professeur_id.__v,
            },
            __v: devoir.matiere.__v,
          },
          __v: devoir.__v,
        };
      });

      res.json(data);
    }
  );
}

// Récupérer les devoirs non notés par les étudiants (GET)
async function getDevoirsNonNotes(req, res) {
  try {
    const devoirId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalDocs = await DevoirEtudiant.countDocuments({
      devoir_id: ObjectId(devoirId),
      note: null,
      dateLivraison: { $ne: null },
    });
    const totalPages = Math.ceil(totalDocs / limit);
    const pagingCounter = (page - 1) * limit + 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const devoirsEtudiants = await DevoirEtudiant.find({
      devoir_id: ObjectId(devoirId),
      note: null,
      dateLivraison: { $ne: null },
    })
      .populate("etudiant_id")
      .sort({ dateLivraison: 1 })
      .skip(skip)
      .limit(limit);

    const docs = devoirsEtudiants.map((devoirEtudiant) => {
      return {
        _id: devoirEtudiant._id,
        note: devoirEtudiant.note,
        remarques_note: devoirEtudiant.remarques_note,
        dateLivraison: devoirEtudiant.dateLivraison,
        dateNotation: devoirEtudiant.dateNotation,
        devoir_id: devoirEtudiant.devoir_id,
        etudiant_id: {
          _id: devoirEtudiant.etudiant_id._id,
          nom: devoirEtudiant.etudiant_id.nom,
          prenom: devoirEtudiant.etudiant_id.prenom,
          mail: devoirEtudiant.etudiant_id.mail,
        },
      };
    });

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
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des devoirs non notés :",
      error
    );
    res.status(500).json({ error: "Erreur serveur : " + error });
  }
}

// Récupérer les devoirs notés par les étudiants (GET)
async function getDevoirsNotes(req, res) {
  try {
    const devoirId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalDocs = await DevoirEtudiant.countDocuments({
      devoir_id: ObjectId(devoirId),
      note: { $ne: null },
    });
    const totalPages = Math.ceil(totalDocs / limit);
    const pagingCounter = (page - 1) * limit + 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const devoirsEtudiants = await DevoirEtudiant.find({
      devoir_id: ObjectId(devoirId),
      note: { $ne: null },
    })
      .populate("etudiant_id")
      .sort({ dateNotation: -1 })
      .skip(skip)
      .limit(limit);

    const docs = devoirsEtudiants.map((devoirEtudiant) => {
      return {
        _id: devoirEtudiant._id,
        note: devoirEtudiant.note,
        remarques_note: devoirEtudiant.remarques_note,
        dateLivraison: devoirEtudiant.dateLivraison,
        dateNotation: devoirEtudiant.dateNotation,
        devoir_id: devoirEtudiant.devoir_id,
        etudiant_id: {
          _id: devoirEtudiant.etudiant_id._id,
          nom: devoirEtudiant.etudiant_id.nom,
          prenom: devoirEtudiant.etudiant_id.prenom,
          mail: devoirEtudiant.etudiant_id.mail,
        },
      };
    });

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
  } catch (error) {
    console.error("Erreur lors de la récupération des devoirs notés :", error);
    res.status(500).json({ error: "Erreur serveur : " + error });
  }
}

async function noterDevoir(req, res) {
  try {
    const { id } = req.params;
    const { note, remarques_note } = req.body;

    if (typeof note !== "number" || note < 0 || note > 20) {
      return res
        .status(400)
        .json({ error: "La note doit être un nombre entre 0 et 20" });
    }

    const devoirEtudiant = await DevoirEtudiant.findById(id);
    if (!devoirEtudiant) {
      return res.status(404).json({ error: "Devoir étudiant non trouvé" });
    }

    devoirEtudiant.note = note;
    devoirEtudiant.remarques_note = remarques_note;
    devoirEtudiant.dateNotation = new Date();

    await devoirEtudiant.save();

    res
      .status(200)
      .json({ message: "Devoir noté avec succès", devoirEtudiant });
  } catch (error) {
    console.error("Erreur lors de la notation du devoir étudiant :", error);
    res.status(500).json({ error: "Erreur serveur : " + error });
  }
}

module.exports = {
  getDevoirs,
  postDevoir,
  getDevoir,
  updateDevoir,
  deleteDevoir,
  getDevoirsParProfesseur,
  getDevoirsNonNotes,
  getDevoirsNotes,
  noterDevoir,
};
