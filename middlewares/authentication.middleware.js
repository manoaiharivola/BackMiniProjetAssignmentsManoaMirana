let passport = require("passport");

const verifyCallback =
  (req, resolve, reject, requiredRights) => async (err, etudiant, info) => {
    if (err || info || !etudiant) {
      return reject({
        status: 401,
        message: "Please authenticate.",
      });
    }
    req.etudiant = etudiant;
    if (requiredRights && requiredRights.length) {
    }
    resolve();
  };

const authenticationMiddleware =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => {
        if (err.status === 401) {
          return res.status(401).json({ message: err.message });
        }
        next(err);
      });
  };

module.exports = authenticationMiddleware;
