let Teacher = require("../model/teacher");
let TeacherConnection = require("../model/teacher_connection");
let bcrypt = require("bcrypt");
let TokenService = require("./token.service");

const teacherAuthenticationService = {
  register,
  login,
};

function register(req, res) {
  let teacher = new Teacher();
  teacher.nom = req.body.nom;
  teacher.prenom = req.body.prenom;
  teacher.mail = req.body.mail;

  let mdp = req.body.mdp;

  TeacherConnection.findOne(
    { mail: teacher.mail },
    (err, existingTeacherConnection) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erreur lors de la recherche de professeur." });
      }

      if (existingTeacherConnection) {
        return res
          .status(409)
          .json({ message: "Un professeur avec cet email existe déjà." });
      }

      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(mdp, salt);

      const newTeacherConnection = new TeacherConnection({
        mail: teacher.mail,
        mdp_hash: hash,
      });

      newTeacherConnection.save((err, savedTeacherConnection) => {
        if (err) {
          return res.status(500).json({
            message: "Erreur lors de la création du nouvel professeur.",
          });
        }

        teacher.teacher_connection_id = savedTeacherConnection._id;

        teacher.save((err) => {
          if (err) {
            return TeacherConnection.findByIdAndDelete(
              savedTeacherConnection._id,
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

async function login(req, res) {
  const { mail, mdp } = req.body;

  TeacherConnection.findOne(
    { mail: mail },
    (err, existingTeacherConnection) => {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de la recherche de connexion de professeur.",
        });
      }

      if (!existingTeacherConnection) {
        return res.status(401).json({
          message: "Email ou mot de passe incorrect.",
        });
      }

      const match = bcrypt.compareSync(mdp, existingTeacherConnection.mdp_hash);

      if (!match) {
        return res.status(401).json({
          message: "Email ou mot de passe incorrect.",
        });
      }

      Teacher.findOne(
        { teacher_connection_id: existingTeacherConnection._id },
        async (err, teacher) => {
          if (err) {
            return res.status(500).json({
              message: "Erreur lors de la recherche de professeur.",
            });
          }

          if (!teacher) {
            return res.status(404).json({
              message:
                "Les informations de l'professeur n'ont pas été trouvées.",
            });
          }

          try {
            let { teacher_access_token, expires_at } =
              await TokenService.generateTeacherAuthTokens(teacher);

            res.status(200).json({
              teacher_access_token: teacher_access_token,
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

module.exports = teacherAuthenticationService;
