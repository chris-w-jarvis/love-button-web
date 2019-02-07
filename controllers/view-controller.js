const Mustache = require('mustache')
const fs = require('fs')

const Pages = require('../models/pages')

// read html file to memory
var htmlTemplate = '';
fs.readFile('/app/views/sendMoneyPage.html', 'utf8', function(err, data) {htmlTemplate = data});

module.exports = function(req, res, next) {
  // find corresponding public key in db for req.params.pageId
  Pages.findOne({
    where: {
      pageId: req.params.pageId
    }
  }).then(
    (page) => {
      //console.log('****\n****\nDB response:\n'+page)
      res.send(Mustache.render(htmlTemplate, {key:page.publicKey, name:page.name}))
    }
  )
  .catch(
    (err) => {
      res.sendStatus(404)
      console.log(err)
    }
  )
}