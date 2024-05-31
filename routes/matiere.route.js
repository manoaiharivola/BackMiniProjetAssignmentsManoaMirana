let express = require("express");
let router = express.Router();
let matiereService = require("../services/matiere.service");
let professeurAuthenticationMiddleware = require("../middlewares/professeur_authentication.middleware");
let upload = require("../middlewares/upload_file.middleware");

router.post(
  "/",
  professeurAuthenticationMiddleware(),
  upload.single('matiere_image'),
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
  "/professeur",
  professeurAuthenticationMiddleware(),
  matiereService.getProfesseurMatieres
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
