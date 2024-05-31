let Etudiant = require("../model/etudiant");
let EtudiantConnection = require("../model/etudiant_connexion");
let bcrypt = require("bcrypt");
let TokenService = require("./token.service");

const authenticationService = {
  inscription,
  connexion,
};

function inscription(req, res) {
  let etudiant = new Etudiant();
  if (req.file) {
    etudiant.photo = req.file.path;
  }
  etudiant.nom = req.body.nom;
  etudiant.prenom = req.body.prenom;
  etudiant.mail = req.body.mail;

  let mdp = req.body.mdp;

  EtudiantConnection.findOne(
    { mail: etudiant.mail },
    (err, existingEtudiantConnection) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erreur lors de la recherche d'etudiant." });
      }

      if (existingEtudiantConnection) {
        return res
          .status(409)
          .json({ message: "Un etudiant avec cet email existe déjà." });
      }

      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(mdp, salt);

      const newEtudiantConnection = new EtudiantConnection({
        mail: etudiant.mail,
        mdp_hash: hash,
      });

      newEtudiantConnection.save((err, savedEtudiantConnection) => {
        if (err) {
          return res.status(500).json({
            message: "Erreur lors de la création du nouvel etudiant.",
          });
        }

        etudiant.etudiant_connexion_id = savedEtudiantConnection._id;

        etudiant.save((err) => {
          if (err) {
            return EtudiantConnection.findByIdAndDelete(
              savedEtudiantConnection._id,
              (deleteErr) => {
                if (deleteErr) {
                  res.status(500).json({
                    message:
                      "Erreur lors de la suppression de l'etudiant après échec de la sauvegarde.",
                  });
                }
                res.status(500).json({
                  message:
                    "Erreur lors de la sauvegarde des détails de l'etudiant.",
                });
              }
            );
          }

          res.status(201).json({
            message: "Nouvel etudiant créé avec succès et détails sauvegardés.",
          });
        });
      });
    }
  );
}

async function connexion(req, res) {
  const { mail, mdp } = req.body;

  EtudiantConnection.findOne(
    { mail: mail },
    (err, existingEtudiantConnection) => {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de la recherche de connexion d'etudiant.",
        });
      }

      if (!existingEtudiantConnection) {
        return res.status(401).json({
          message: "Email ou mot de passe incorrect.",
        });
      }

      const match = bcrypt.compareSync(
        mdp,
        existingEtudiantConnection.mdp_hash
      );

      if (!match) {
        return res.status(401).json({
          message: "Email ou mot de passe incorrect.",
        });
      }

      Etudiant.findOne(
        { etudiant_connexion_id: existingEtudiantConnection._id },
        async (err, etudiant) => {
          if (err) {
            return res.status(500).json({
              message: "Erreur lors de la recherche d'etudiant.",
            });
          }

          if (!etudiant) {
            return res.status(404).json({
              message: "Les informations de l'etudiant n'ont pas été trouvées.",
            });
          }

          try {
            let { access_token, expires_at } =
              await TokenService.generateAuthTokens(etudiant);

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
    }
  );
}

module.exports = authenticationService;
