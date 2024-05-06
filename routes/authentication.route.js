let express = require("express");
let router = express.Router();
let authenticationService = require("../services/authentication.service");

router.post("/login", authenticationService.login);
router.post("/register", authenticationService.register);

module.exports = router;
