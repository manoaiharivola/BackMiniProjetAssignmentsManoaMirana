// services/devoirEtudiantService.js
let DevoirEtudiant = require("../model/devoir_etudiant");
let Matiere = require("../model/matiere");

async function creerDevoirsEtudiants(devoirId, matiereId, session) {
  try {
    const matiere = await Matiere.findById(matiereId).session(session);
    if (!matiere) {
      let errorString =
        "La matière avec l'ID " + matiereId + " n'a pas été trouvée.";
      throw new Error(errorString);
    }

    const etudiantsIds = matiere.etudiant_inscrits;

    const devoirsEtudiants = etudiantsIds.map((etudiantId) => ({
      devoir_id: devoirId,
      etudiant_id: etudiantId,
      note: 0,
      remarques_note: "",
    }));

    await DevoirEtudiant.insertMany(devoirsEtudiants, { session });
    return { message: "Devoirs étudiants créés avec succès." };
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = { creerDevoirsEtudiants };
