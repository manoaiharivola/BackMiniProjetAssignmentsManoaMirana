let express = require("express");
let router = express.Router();
let professeurAuthenticationService = require("../services/professeur_authentication.service");
let upload = require("../middlewares/upload_file.middleware");

router.post("/connexion", professeurAuthenticationService.connexion);
router.post(
  "/inscription",
  upload.single("professeur_image"),
  professeurAuthenticationService.inscription
);

module.exports = router;
