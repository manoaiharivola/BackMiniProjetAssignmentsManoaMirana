const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

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
  dateLivraison: { type: Date, default: null },
  dateNotation: { type: Date, default: null },
});

DevoirEtudiantSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("devoir_etudiant", DevoirEtudiantSchema);
