let express = require("express");
let router = express.Router();
let professeurAuthenticationService = require("../services/professeur_authentication.service");

router.post("/connexion", professeurAuthenticationService.connexion);
router.post("/inscription", professeurAuthenticationService.inscription);

module.exports = router;
