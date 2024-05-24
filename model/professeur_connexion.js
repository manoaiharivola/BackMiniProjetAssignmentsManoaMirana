let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ProfesseurConnectionSchema = Schema({
  mail: String,
  mdp_hash: String,
});

module.exports = mongoose.model(
  "professeur_connections",
  ProfesseurConnectionSchema
);
