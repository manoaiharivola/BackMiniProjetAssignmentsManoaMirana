let passport = require("passport");

const verifyCallback =
  (req, resolve, reject, requiredRights) => async (err, professeur, info) => {
    if (err || info || !professeur) {
      return reject({
        status: 401,
        message: "Please authenticate.",
      });
    }
    req.professeur = professeur;
    if (requiredRights && requiredRights.length) {
    }
    resolve();
  };

const professeurAuthenticationMiddleware =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwtProfesseur",
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

module.exports = professeurAuthenticationMiddleware;
