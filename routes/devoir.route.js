let express = require("express");
let router = express.Router();
let devoirService = require("../services/devoir.service");
let professeurAuthenticationMiddleware = require("../middlewares/professeur_authentication.middleware");
let authenticationMiddleware = require("../middlewares/authentication.middleware");

router.post(
  "/",
  professeurAuthenticationMiddleware(),
  devoirService.postDevoir
);
router.put("/", devoirService.updateDevoir);
router.get("/", devoirService.getDevoirs);

router.get(
  "/professeur",
  professeurAuthenticationMiddleware(),
  devoirService.getDevoirsParProfesseur
);

router.get('/etudiant/a-rendre', authenticationMiddleware(),devoirService.getDevoirsARendre);

router.get('/etudiant/rendus', authenticationMiddleware(),devoirService.getDevoirsRendus);

router.get("/:id", devoirService.getDevoir);
router.delete("/:id", devoirService.deleteDevoir);

// Nouvelles routes pour récupérer les devoirs notés et non notés avec pagination
router.get('/:id/nonnotes', professeurAuthenticationMiddleware(), devoirService.getDevoirsNonNotes);
router.get('/:id/notes', professeurAuthenticationMiddleware(), devoirService.getDevoirsNotes);

router.put('/:id/noter', 
  professeurAuthenticationMiddleware(), 
  devoirService.noterDevoir
);


module.exports = router;
