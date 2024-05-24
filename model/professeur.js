let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

let ProfesseurSchema = Schema({
  nom: String,
  prenom: String,
  mail: String,
  professeur_connexion_id: Object,
});

ProfesseurSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("professeurs", ProfesseurSchema);
