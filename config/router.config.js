let devoirRoute = require("../routes/devoir.route");
let authenticationRoute = require("../routes/authentication.route");
let professeurAuthenticationRoute = require("../routes/professeur_authentication.route");
let matiereRoute = require("../routes/matiere.route");
let professeurRoute = require("../routes/professeur.route");
let etudiantRoute = require("../routes/etudiant.route");
const configureRouter = (app) => {
  const prefix = "/api";
  app.use(prefix + "/devoirs", devoirRoute);
  app.use(prefix + "/authentication", authenticationRoute);
  app.use(prefix + "/professeur/authentication", professeurAuthenticationRoute);
  app.use(prefix + "/matieres", matiereRoute);
  app.use(prefix + "/professeurs", professeurRoute);
  app.use(prefix + "/etudiants", etudiantRoute);
};

module.exports = configureRouter;
