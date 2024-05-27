const mongoose = require("mongoose");

const DevoirEtudiantSchema = new mongoose.Schema({
  devoir_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "devoirs",
    required: true,
  },
  etudiant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "etudiants",
    required: true,
  },
  note: { type: Number, default: 0 },
  remarques_note: { type: String, default: "" },
});

module.exports = mongoose.model("devoir_etudiant", DevoirEtudiantSchema);
