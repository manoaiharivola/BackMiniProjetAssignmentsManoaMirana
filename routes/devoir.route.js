let express = require("express");
let router = express.Router();
let devoirService = require("../services/devoir.service");

router.post("/", devoirService.postDevoir);
router.put("/", devoirService.updateDevoir);
router.get("/", devoirService.getDevoirs);

router.get("/:id", devoirService.getDevoir);
router.delete("/:id", devoirService.deleteDevoir);

module.exports = router;
