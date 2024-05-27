// services/devoirEtudiantService.js
let DevoirEtudiant = require("../model/devoir_etudiant");
let Matiere = require("../model/matiere");

async function creerDevoirsEtudiants(devoirId, matiereId, session) {
  try {
    const matiere = await Matiere.findById(matiereId).session(session);
    if (!matiere) {
      throw new Error(
        "La matière avec l'ID",
        matiereId,
        "n'a pas été trouvée."
      );
    }

    const etudiantsIds = matiere.etudiant_inscrits;

    console.log("*******************");
    console.log(etudiantsIds);
    const devoirsEtudiants = etudiantsIds.map((etudiantId) => ({
      devoir_id: devoirId,
      etudiant_id: etudiantId,
      note: 0,
      remarques_note: "",
    }));

    console.log(devoirsEtudiants);

    await DevoirEtudiant.insertMany(devoirsEtudiants, { session });
    return { message: "Devoirs étudiants créés avec succès." };
  } catch (error) {
    throw new Error(
      "Erreur lors de la création des devoirs étudiants : " + error.message
    );
  }
}

module.exports = { creerDevoirsEtudiants };
