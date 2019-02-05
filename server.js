// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const viewController = require('./controllers/view-controller')
const Api = require('./api-router')

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// VIEWS
app.get('/get-my-link', function(request, response) {
  response.sendFile(__dirname + '/views/getLink.html');
});

// render html for each url on /pages
app.get('/pages/:pageId', viewController)

// send all other requests to api router
Api(app)

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
