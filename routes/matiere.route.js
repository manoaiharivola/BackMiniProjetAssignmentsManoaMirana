let express = require("express");
let router = express.Router();
let matiereService = require("../services/matiere.service");
let professeurAuthenticationMiddleware = require("../middlewares/professeur_authentication.middleware");

router.post(
  "/",
  professeurAuthenticationMiddleware(),
  matiereService.postMatiere
);
router.put(
  "/",
  professeurAuthenticationMiddleware(),
  matiereService.updateMatiere
);
router.get(
  "/",
  professeurAuthenticationMiddleware(),
  matiereService.getMatieres
);

router.get(
  "/:id",
  professeurAuthenticationMiddleware(),
  matiereService.getMatiere
);
router.delete(
  "/:id",
  professeurAuthenticationMiddleware(),
  matiereService.deleteMatiere
);

// Route pour ajouter des etudiants à une matière spécifique
router.post(
  "/:id/ajouter-etudiants",
  professeurAuthenticationMiddleware(),
  matiereService.ajouterEtudiants
);

router.get(
  "/:id/etudiants",
  professeurAuthenticationMiddleware(),
  matiereService.getEtudiantsParMatiere
);

module.exports = router;
