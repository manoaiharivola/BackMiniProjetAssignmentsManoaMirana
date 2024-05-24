let jwt = require("jsonwebtoken");
let moment = require("moment");

const generateToken = (
  etudiantId,
  expires,
  type,
  secret = process.env.JWT_SECRET
) => {
  const payload = {
    sub: etudiantId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const generateAuthTokens = async (etudiant) => {
  const accessTokenExpires = moment().add(
    process.env.JWT_ACCESS_EXPIRATION_DURATION,
    "minutes"
  );

  const accessToken = generateToken(etudiant._id, accessTokenExpires, "ACCESS");
  return {
    access_token: accessToken,
    expires_at: accessTokenExpires.toDate(),
  };
};

const generateProfesseurAuthTokens = async (professeur) => {
  const accessTokenExpires = moment().add(
    process.env.JWT_ACCESS_EXPIRATION_DURATION,
    "minutes"
  );

  const professeur_access_token = generateToken(
    professeur._id,
    accessTokenExpires,
    "ACCESS"
  );
  return {
    professeur_access_token: professeur_access_token,
    expires_at: accessTokenExpires.toDate(),
  };
};

const tokenService = {
  generateToken,
  generateAuthTokens,
  generateProfesseurAuthTokens,
};
module.exports = tokenService;
