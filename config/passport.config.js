let { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
let Etudiant = require("../model/etudiant");
let dotenv = require("dotenv");
const Professeur = require("../model/professeur");
dotenv.config();

let secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

let jwtOptions = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== "ACCESS") {
      throw new Error("Invalid token type");
    }

    const etudiant = await Etudiant.findById(payload.sub);
    if (!etudiant) {
      return done(null, false);
    }
    done(null, etudiant);
  } catch (error) {
    done(error, false);
  }
};

const jwtProfesseurVerify = async (payload, done) => {
  try {
    if (payload.type !== "ACCESS") {
      throw new Error("Invalid token type");
    }

    const professeur = await Professeur.findById(payload.sub);
    if (!professeur) {
      return done(null, false);
    }
    done(null, professeur);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
const jwtProfesseurStrategy = new JwtStrategy(jwtOptions, jwtProfesseurVerify);

const passportConfig = {
  jwtStrategy,
  jwtProfesseurStrategy,
};

module.exports = passportConfig;
