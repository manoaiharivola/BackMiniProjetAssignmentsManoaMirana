let jwt = require("jsonwebtoken");
let moment = require("moment");

const generateToken = (
  userId,
  expires,
  type,
  secret = process.env.JWT_SECRET
) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(
    process.env.JWT_ACCESS_EXPIRATION_DURATION,
    "minutes"
  );

  const accessToken = generateToken(user._id, accessTokenExpires, "ACCESS");
  return {
    access_token: accessToken,
    expires_at: accessTokenExpires.toDate(),
  };
};

const tokenService = {
  generateToken,
  generateAuthTokens,
};
module.exports = tokenService;