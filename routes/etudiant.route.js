let express = require("express");
let router = express.Router();
let etudiantService = require("../services/etudiant.service");
let authenticationMiddleware = require("../middlewares/authentication.middleware");
let professeurAuthenticationMiddleware = require("../middlewares/professeur_authentication.middleware");

/* get de l'étudiant connecté*/
router.get(
  "/connected",
  authenticationMiddleware(),
  etudiantService.getEtudiantConnected
);

router.get('/liste', professeurAuthenticationMiddleware(), etudiantService.getListeEtudiants);

module.exports = router;
