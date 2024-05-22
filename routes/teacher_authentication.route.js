let express = require("express");
let router = express.Router();
let teacherAuthenticationService = require("../services/teacher_authentication.service");

router.post("/login", teacherAuthenticationService.login);
router.post("/register", teacherAuthenticationService.register);

module.exports = router;
