let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

let TeacherSchema = Schema({
  nom: String,
  prenom: String,
  mail: String,
  teacher_connection_id: Object,
});

TeacherSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("teachers", TeacherSchema);
