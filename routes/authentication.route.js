let express = require("express");
let router = express.Router();
let authenticationService = require("../services/authentication.service");

router.post("/connexion", authenticationService.connexion);
router.post("/inscription", authenticationService.inscription);

module.exports = router;
