let express = require("express");
let router = express.Router();
let etudiantService = require("../services/etudiant.service");
let authenticationMiddleware = require("../middlewares/authentication.middleware");

router.get("/:id", authenticationMiddleware(), etudiantService.getEtudiant);

module.exports = router;
