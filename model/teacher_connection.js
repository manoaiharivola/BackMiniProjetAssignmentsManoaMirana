let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let TeacherConnectionSchema = Schema({
  mail: String,
  mdp_hash: String,
});

module.exports = mongoose.model("teacher_connections", TeacherConnectionSchema);
