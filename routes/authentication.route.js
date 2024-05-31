let express = require("express");
let router = express.Router();
let authenticationService = require("../services/authentication.service");
let upload = require("../middlewares/upload_file.middleware");

router.post("/connexion", authenticationService.connexion);
router.post(
  "/inscription",
  upload.single("etudiant_image"),
  authenticationService.inscription
);

module.exports = router;
