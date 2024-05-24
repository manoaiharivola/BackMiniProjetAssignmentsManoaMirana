let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let EtudiantConnectionSchema = Schema({
  mail: String,
  mdp_hash: String,
});

module.exports = mongoose.model(
  "etudiant_connexions",
  EtudiantConnectionSchema
);
