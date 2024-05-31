const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const configureRouter = require("./config/router.config");
const passport = require("passport");
const {
  jwtStrategy,
  jwtProfesseurStrategy,
} = require("./config/passport.config");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.DB_URI;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

mongoose.connect(uri, options).then(
  () => {
    console.log("Connecté à la base MongoDB devoirs dans le cloud !");
    console.log("at URI = " + uri);
    console.log(
      "vérifiez with http://localhost:" +
        port +
        "/api/devoirs que cela fonctionne"
    );
  },
  (err) => {
    console.log("Erreur de connexion: ", err);
  }
);

// Middleware pour accepter les connexions cross-domain (CORS)
app.use(cors());

// Middleware pour parser les requêtes JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware pour initialiser Passport
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);
passport.use("jwtProfesseur", jwtProfesseurStrategy);

// Obligatoire si déploiement dans le cloud !
const port = process.env.PORT || 2324;

// Middleware pour autoriser les requêtes CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Router
configureRouter(app);

// Démarrer le serveur
app.listen(port, "0.0.0.0", () => {
  console.log("Serveur démarré sur http://localhost:" + port);
});

module.exports = app;
