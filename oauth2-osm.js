"use strict";

const fs = require("fs");

const passport     = require("passport");
const OAuth2Strategy = require("passport-oauth2").Strategy;

const txml = require("txml");


const config = JSON.parse(fs.readFileSync("./config.json").toString());


passport.serializeUser(function (user, done) {
  done(null, user);
});


passport.deserializeUser(function (user, done) {

  return done(null, user);
});



const client =  new OAuth2Strategy({
  authorizationURL: config.OpenStreetmapOauth2.authorizationURL,
  tokenURL: config.OpenStreetmapOauth2.tokenURL,
  clientID: config.OpenStreetmapOauth2.clientID,
  clientSecret: config.OpenStreetmapOauth2.clientSecret,
  callbackURL: config.OpenStreetmapOauth2.callbackURL,
  scope: config.OpenStreetmapOauth2.scope
},
function(accessToken, refreshToken, params, profile, cb) {
  console.dir(profile);
  return cb(null, profile);
});



if (client._oauth2) {
  client._oauth2.useAuthorizationHeaderforGET(true);
  client.userProfile = function (accesstoken, done) {
    console.dir("load user Profile from OSM");
    this._oauth2.get("https://api.openstreetmap.org/api/0.6/user/details", accesstoken, (err, body, res) => {
      if (err) {
        return done(err);
      }
      function filter(o) {
        if (o.tagName != "user") return false;
        return true;
      }
      const result = txml.parse(body,{filter:filter});
      const userProfile = { displayName: result[0].attributes.display_name, id: result[0].attributes.id };
      return done(null, userProfile);
    });
  };
}

passport.use(client);




function ensureAuthenticated (req, res, next) {
  // Check wether user is already Authenitated
  if (req.isAuthenticated()) {
    // just go ahead 
    return next();
  }
  // redirect to a page that handles the failed login
  return res.redirect("/auth/openstreetmap");
}

module.exports.initialise = function initialise(app) {
    
  app.use(passport.initialize());
  app.use(passport.session());

  function renderLogin(req, res) {
    res.send("This is the login page");
  }
  app.get("/login", renderLogin);

  function logText(text) {
    return (req, res, next) => {
      console.log(res.uri);
      console.log(res.body);
      console.log("----> additional logger " + text);
      next();
    };
  }

  app.get("/auth/openstreetmap", logText("Before passport.authenticate"),
    passport.authenticate("oauth2"), logText("After passport.authenticate"));


  app.get("/auth/openstreetmap/callback",
    logText("Before passport.authenticate / Callback"),
    passport.authenticate("oauth2", { failureRedirect: "/login" }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect(  "/");
    }, logText(logText("After passport.authenticate / Callback")));

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/logout");
  });

  // layout does not render, but prepares the res.rendervar variable for
  // dynamic contend in layout.pug
  app.use("/", logText("Before Ensure Athenticated"), ensureAuthenticated, logText("After Ensure Athenticated"));

}