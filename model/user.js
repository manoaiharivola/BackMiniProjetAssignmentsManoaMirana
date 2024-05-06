let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

let UserSchema = Schema({
  nom: String,
  prenom: String,
  mail: String,
  user_connection_id: Object,
});

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("users", UserSchema);
