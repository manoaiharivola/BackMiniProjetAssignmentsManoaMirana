let express = require("express");
let router = express.Router();
let professeurService = require("../services/professeur.service");
let professeurAuthenticationMiddleware = require("../middlewares/professeur_authentication.middleware");

router.get(
  "/connected",
  professeurAuthenticationMiddleware(),
  professeurService.getProfesseurConnected
);

module.exports = router;
