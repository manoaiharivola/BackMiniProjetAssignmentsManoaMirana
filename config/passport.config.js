let { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
let User = require("../model/user");
let dotenv = require("dotenv");
const Teacher = require("../model/teacher");
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

    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtTeacherVerify = async (payload, done) => {
  try {
    if (payload.type !== "ACCESS") {
      throw new Error("Invalid token type");
    }

    const teacher = await Teacher.findById(payload.sub);
    if (!teacher) {
      return done(null, false);
    }
    done(null, teacher);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
const jwtTeacherStrategy = new JwtStrategy(jwtOptions, jwtTeacherVerify);

const passportConfig = {
  jwtStrategy,
  jwtTeacherStrategy,
};

module.exports = passportConfig;
