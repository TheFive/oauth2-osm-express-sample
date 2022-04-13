// Hello Word example copied from https://expressjs.com/de/starter/hello-world.html
// Mar 2022 TheFive
const fs = require("fs");
const express = require('express')
const oauth2Osm = require("./oauth2-osm.js");
const app = express()
const port = 3000;

// Session example copied from http://expressjs.com/en/resources/middleware/session.html
// Mar 2022 TheFive

const session = require('express-session');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {secure:false }
}));



// Tiny logger, that shows all callbacks
// Mar 22 TheFive
app.use((req, res, next) => {console.log("request: " + req.url);console.log("requestb:" + req.body);next()});



// Sample pages to document Authorisation Workflow Variations
// Mar 22 TheFive
app.get('/login-failed', (req, res) => {
  res.send('Sorry but your login failed.')
})

app.get('/logout', (req, res) => {
  res.send('You are logged out.')
})

// simple Error Handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// This Line introduces OpenStreetMap Oauth2 Authorisation
// all pages defined after "ensureAuthenticated" in that module
// require Authentication
oauth2Osm.initialise(app);



app.get('/', (req, res) => {
  res.send(`Hello ${req.user.displayName} ! I know you are Number: ${req.user.id}`);
})

console.log("Starting Server");
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


