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
  note: { type: Number, default: null },
  remarques_note: { type: String, default: "" },
  rendu: { type: Boolean, default: false },
});

module.exports = mongoose.model("devoir_etudiant", DevoirEtudiantSchema);
