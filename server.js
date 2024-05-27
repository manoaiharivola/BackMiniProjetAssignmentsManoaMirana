let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let cors = require("cors");
let configureRouter = require("./config/router.config");
let passport = require("passport");
let {
  jwtStrategy,
  jwtProfesseurStrategy,
} = require("./config/passport.config");

let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
// mongoose.set('debug', true);

let dotenv = require("dotenv");
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

// Pour accepter les connexions cross-domain (CORS)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());
/*app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});*/

//Middlewares

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);
passport.use("jwtProfesseur", jwtProfesseurStrategy);

// Pour les formulaires
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Obligatoire si déploiement dans le cloud !
let port = process.env.PORT;

// Router
configureRouter(app);

// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log("Serveur démarré sur http://localhost:" + port);

module.exports = app;
