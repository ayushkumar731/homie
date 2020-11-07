const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const AppError = require("./AppError");

const User = require("../models/user");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

let opts = {
  jwtFromRequest: (req) => cookieExtractor(req),
  // jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  new JWTStrategy(opts, function (jwtPayload, done) {
    User.findById(jwtPayload._id, function (err, user) {
      //when user changed password then he/she can't be used old token after changed the password
      if (user) {
        if (user.updatedAt) {
          const changedTimeStamp = parseInt(
            user.updatedAt.getTime() / 1000,
            10
          );
          if (jwtPayload.iat < changedTimeStamp) {
            return done(null, false);
          }
        }
      }

      if (err) {
        console.log("error in finding user from JWT");
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.jwt;
  }
  return token;
};

module.exports = passport;
