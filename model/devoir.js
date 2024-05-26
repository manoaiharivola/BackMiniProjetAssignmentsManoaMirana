let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

let DevoirSchema = Schema({
  dateDeRendu: Date,
  nom: String,
  description: String,
  rendu: Boolean,
  matiere_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "matieres",
    required: true,
  },
});

DevoirSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("devoirs", DevoirSchema);
