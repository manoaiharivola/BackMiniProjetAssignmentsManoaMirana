let passport = require("passport");

const verifyCallback =
  (req, resolve, reject, requiredRights) => async (err, teacher, info) => {
    if (err || info || !teacher) {
      return reject({
        status: 401,
        message: "Please authenticate.",
      });
    }
    req.teacher = teacher;
    if (requiredRights && requiredRights.length) {
    }
    resolve();
  };

const teacherAuthenticationMiddleware =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwtTeacher",
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

module.exports = teacherAuthenticationMiddleware;
