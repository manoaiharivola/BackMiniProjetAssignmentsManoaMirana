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

router.get("/:id", devoirService.getDevoir);
router.delete("/:id", devoirService.deleteDevoir);

module.exports = router;
