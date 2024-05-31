let Professeur = require("../model/professeur");
let ProfesseurConnection = require("../model/professeur_connexion");
let bcrypt = require("bcrypt");
let TokenService = require("./token.service");

const professeurAuthenticationService = {
  inscription,
  connexion,
};

function inscription(req, res) {
  let professeur = new Professeur();
  if (req.file) {
    professeur.photo = req.file.path;
  }
  professeur.nom = req.body.nom;
  professeur.prenom = req.body.prenom;
  professeur.mail = req.body.mail;

  let mdp = req.body.mdp;

  ProfesseurConnection.findOne(
    { mail: professeur.mail },
    (err, existingProfesseurConnection) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erreur lors de la recherche de professeur." });
      }

      if (existingProfesseurConnection) {
        return res
          .status(409)
          .json({ message: "Un professeur avec cet email existe déjà." });
      }

      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(mdp, salt);

      const newProfesseurConnection = new ProfesseurConnection({
        mail: professeur.mail,
        mdp_hash: hash,
      });

      newProfesseurConnection.save((err, savedProfesseurConnection) => {
        if (err) {
          return res.status(500).json({
            message: "Erreur lors de la création du nouvel professeur.",
          });
        }

        professeur.professeur_connexion_id = savedProfesseurConnection._id;

        professeur.save((err) => {
          if (err) {
            return ProfesseurConnection.findByIdAndDelete(
              savedProfesseurConnection._id,
              (deleteErr) => {
                if (deleteErr) {
                  res.status(500).json({
                    message:
                      "Erreur lors de la suppression de l'professeur après échec de la sauvegarde.",
                  });
                }
                res.status(500).json({
                  message:
                    "Erreur lors de la sauvegarde des détails de l'professeur.",
                });
              }
            );
          }

          res.status(201).json({
            message:
              "Nouvel professeur créé avec succès et détails sauvegardés.",
          });
        });
      });
    }
  );
}

async function connexion(req, res) {
  const { mail, mdp } = req.body;

  ProfesseurConnection.findOne(
    { mail: mail },
    (err, existingProfesseurConnection) => {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de la recherche de connexion de professeur.",
        });
      }

      if (!existingProfesseurConnection) {
        return res.status(401).json({
          message: "Email ou mot de passe incorrect.",
        });
      }

      const match = bcrypt.compareSync(
        mdp,
        existingProfesseurConnection.mdp_hash
      );

      if (!match) {
        return res.status(401).json({
          message: "Email ou mot de passe incorrect.",
        });
      }

      Professeur.findOne(
        { professeur_connexion_id: existingProfesseurConnection._id },
        async (err, professeur) => {
          if (err) {
            return res.status(500).json({
              message: "Erreur lors de la recherche de professeur.",
            });
          }

          if (!professeur) {
            return res.status(404).json({
              message:
                "Les informations de l'professeur n'ont pas été trouvées.",
            });
          }

          try {
            let { professeur_access_token, expires_at } =
              await TokenService.generateProfesseurAuthTokens(professeur);

            res.status(200).json({
              professeur_access_token: professeur_access_token,
              expires_at: expires_at,
            });
          } catch (tokenErr) {
            res.status(500).json({
              message: "Erreur lors de la génération de  l'access token.",
            });
          }
        }
      );
    }
  );
}

module.exports = professeurAuthenticationService;
