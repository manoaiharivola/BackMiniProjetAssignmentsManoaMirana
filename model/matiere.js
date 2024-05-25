let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

let MatiereSchema = Schema({
  nom: String,
  professeur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "professeurs",
    required: true,
  },
  etudiant_inscrits: [
    { type: mongoose.Schema.Types.ObjectId, ref: "etudiants" },
  ],
});

MatiereSchema.plugin(mongoosePaginate);

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
// devoir est le nom de la collection dans la base de données
// Mongoose tolère certaines erreurs dans le nom (ex: Assignent au lieu de devoirs)
module.exports = mongoose.model("matieres", MatiereSchema);
