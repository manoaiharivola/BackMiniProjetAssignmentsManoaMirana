let User = require("../model/user");
let UserConnection = require("../model/user_connection");
let bcrypt = require("bcrypt");

const authenticationService = {
  register,
};

function register(req, res) {
  let user = new User();
  user.nom = req.body.nom;
  user.prenom = req.body.prenom;
  user.mail = req.body.mail;

  let mdp = req.body.mdp;

  UserConnection.findOne({ mail: user.mail }, (err, existingUserConnection) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la recherche d'utilisateur." });
    }

    if (existingUserConnection) {
      return res
        .status(400)
        .json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(mdp, salt);

    const newUserConnection = new UserConnection({
      mail: user.mail,
      mdp_hash: hash,
    });

    newUserConnection.save((err, savedUserConnection) => {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de la création du nouvel utilisateur.",
        });
      }

      user.user_connection_id = savedUserConnection._id;

      user.save((err) => {
        if (err) {
          return UserConnection.findByIdAndDelete(
            savedUserConnection._id,
            (deleteErr) => {
              if (deleteErr) {
                console.error(
                  "Erreur lors de la suppression de l'utilisateur après échec de la sauvegarde.",
                  deleteErr
                );
              }
              res.status(500).json({
                message:
                  "Erreur lors de la sauvegarde des détails de l'utilisateur.",
              });
            }
          );
        }

        res.status(201).json({
          message:
            "Nouvel utilisateur créé avec succès et détails sauvegardés.",
        });
      });
    });
  });
}

module.exports = authenticationService;
