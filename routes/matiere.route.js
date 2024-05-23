let express = require("express");
let router = express.Router();
let matiereService = require("../services/matiere.service");
let teacherAuthenticationMiddleware = require("../middlewares/teacher_authentication.middleware");

router.post("/", teacherAuthenticationMiddleware(), matiereService.postMatiere);
router.put(
  "/",
  teacherAuthenticationMiddleware(),
  matiereService.updateMatiere
);
router.get("/", teacherAuthenticationMiddleware(), matiereService.getMatieres);

router.get(
  "/:id",
  teacherAuthenticationMiddleware(),
  matiereService.getMatiere
);
router.delete(
  "/:id",
  teacherAuthenticationMiddleware(),
  matiereService.deleteMatiere
);

// Routes pour récupérer le nombre d'etudiants inscrits dans une matière spécifique
router.get(
  "/:id/nombre-etudiants",
  teacherAuthenticationMiddleware(),
  matiereService.getNombreEtudiants
);

// Route pour ajouter des etudiants à une matière spécifique
router.post(
  "/:id/ajouter-etudiants",
  teacherAuthenticationMiddleware(),
  matiereService.ajouterEtudiants
);

module.exports = router;
