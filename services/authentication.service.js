let User = require("../model/user");
let UserConnection = require("../model/user_connection");
let bcrypt = require("bcrypt");
let TokenService = require("./token.service");

const authenticationService = {
  register,
  login,
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
        .status(409)
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
                res.status(500).json({
                  message:
                    "Erreur lors de la suppression de l'utilisateur après échec de la sauvegarde.",
                });
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

async function login(req, res) {
  const { mail, mdp } = req.body;

  UserConnection.findOne({ mail: mail }, (err, existingUserConnection) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la recherche de connexion d'utilisateur.",
      });
    }

    if (!existingUserConnection) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    const match = bcrypt.compareSync(mdp, existingUserConnection.mdp_hash);

    if (!match) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    User.findOne(
      { user_connection_id: existingUserConnection._id },
      async (err, user) => {
        if (err) {
          return res.status(500).json({
            message: "Erreur lors de la recherche d'utilisateur.",
          });
        }

        if (!user) {
          return res.status(404).json({
            message:
              "Les informations de l'utilisateur n'ont pas été trouvées.",
          });
        }

        try {
          let { access_token, expires_at } =
            await TokenService.generateAuthTokens(user);

          res.status(200).json({
            access_token: access_token,
            expires_at: expires_at,
          });
        } catch (tokenErr) {
          res.status(500).json({
            message: "Erreur lors de la génération de  l'access token.",
          });
        }
      }
    );
  });
}

module.exports = authenticationService;
