let assignmentRoute = require("../routes/assignment.route");
let authenticationRoute = require("../routes/authentication.route");
let professeurAuthenticationRoute = require("../routes/professeur_authentication.route");
let matiereRoute = require("../routes/matiere.route");
const configureRouter = (app) => {
  const prefix = "/api";
  app.use(prefix + "/assignments", assignmentRoute);
  app.use(prefix + "/authentication", authenticationRoute);
  app.use(prefix + "/professeur/authentication", professeurAuthenticationRoute);
  app.use(prefix + "/matieres", matiereRoute);
};

module.exports = configureRouter;
