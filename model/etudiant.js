let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

let EtudiantSchema = Schema({
  nom: String,
  prenom: String,
  mail: String,
  etudiant_connexion_id: Object,
});

EtudiantSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("etudiants", EtudiantSchema);
