let express = require("express");
let router = express.Router();
let devoirService = require("../services/devoir.service");
let professeurAuthenticationMiddleware = require("../middlewares/professeur_authentication.middleware");

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

router.get("/:id", devoirService.getDevoir);
router.delete("/:id", devoirService.deleteDevoir);

router.get("/:id/etudiants", 
  professeurAuthenticationMiddleware(),
  devoirService.getDevoirsRendusParEtudiants
);

router.put('/:id/noter', 
  professeurAuthenticationMiddleware(), 
  devoirService.noterDevoir
);


module.exports = router;
