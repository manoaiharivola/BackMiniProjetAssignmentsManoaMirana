let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let UserConnectionSchema = Schema({
  mail: String,
  mdp_hash: String,
});

module.exports = mongoose.model("user_connections", UserConnectionSchema);
