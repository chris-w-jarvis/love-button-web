const Mustache = require('mustache')
const fs = require('fs')
// read html file to memory
var htmlTemplate = '';
fs.readFile('/app/views/sendMoneyPage.html', 'utf8', function(err, data) {htmlTemplate = data});

module.exports = function(req, res, next) {
  // find corresponding public key in db for req.params.pageId
  
  //res.render('index', { key: req.params.pageId , keyMessage: `Send money to ${req.params.pageId}`})
  res.send(Mustache.render(htmlTemplate, {key:req.params.pageId}))
}