let express = require("express");
let router = express.Router();
let assignmentService = require("../services/assignment.service");
let authenticationMiddleware = require("../middlewares/authentication.middleware");
let teacherAuthenticationMiddleware = require("../middlewares/teacher_authentication.middleware");

router.post("/", assignmentService.postAssignment);
router.put("/", assignmentService.updateAssignment);
router.get("/", assignmentService.getAssignments);

router.get("/:id", assignmentService.getAssignment);
router.delete("/:id", assignmentService.deleteAssignment);

module.exports = router;
