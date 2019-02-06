const stellarController = require('./controllers/stellar-controller')
const Pages = require('./models/pages')

// value returned by /api/priceCheck
var stellarPrice = "";
const stellarPriceCheck = function() {
  stellarController.priceCheck().then((price) => {
    stellarPrice = price
  })
  .catch((err)  => {
    console.log(err)
  })
}

stellarPriceCheck()

// QUERY STELLAR PRICE, run this every 4.9 minutes
setInterval(stellarPriceCheck, 294000)

var latestPageId = 0

module.exports = function router(app) {
  app.post('/api/sendMoney', function(req, res) {
    console.log(req.body)
    // DO VALIDATION LOL
    stellarController.sendPayment(req.body.source, req.body.destination, req.body.amount)
    .then((result) => {
       console.log(result)
       res.status(200)
       res.send({hash:result.hash})
      }
    )
    // More informative error handling
    .catch(err => {
      res.sendStatus(400)
      console.log(err)
    })
  })

  app.get('/api/priceCheck', function(req, res) {
    res.send({price:stellarPrice})
  })

  app.post('/api/accountBalance', function(req, res) {
    stellarController.accountBalance(req.body.source)
      .then(balance => res.send({balance: balance}))
      .catch(err => {
        res.sendStatus(404)
        console.log(err)
    })
  })

  app.post('/api/getMyLink', function(req, res) {
    // zerofill latestPageId
    var idString = `${latestPageId}`
    if (idString.length < 6) {
      var idLen = idString.length
      for (i = 0; i < 6-idLen; i++) {
        idString = `0${idString}`
      }
    }
    latestPageId++

    // db
    Pages.create({name:req.body.name, publicKey:req.body.key, pageId:idString}).then(
      (page) => {
        res.send({id:page.pageId})
      }
    )
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })
  })
}