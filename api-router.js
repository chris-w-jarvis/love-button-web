const http = require('http')
const stellarController = require('./controllers/stellar-controller')

module.exports = function router(app) {
  app.post('/sendMoney', function(req, res) {
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

  var stellarPrice = "";

  app.get('/priceCheck', function(req, res) {
    // stellarController.priceCheck().then((price) => res.send({price:price}))
    // .catch((err)  => {
    //   res.sendStatus(404)
    //   console.log(err)
    // })
    res.send({price:stellarPrice})
  })

  app.post('/accountBalance', function(req, res) {
    stellarController.accountBalance(req.body.source)
      .then(balance => res.send({balance: balance}))
      .catch(err => {
        res.sendStatus(404)
        console.log(err)
    })
  })

  // REMOVE THIS IN PROD
  app.get("/uptime", (request, response) => response.sendStatus(200));

  const stellarPriceCheck = function() {
    stellarController.priceCheck().then((price) => {
      stellarPrice = price
      // REMOVE THIS IN PROD
      http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/uptime`);
    })
    .catch((err)  => {
      console.log(err)
    })
  }

  stellarPriceCheck()

  // QUERY STELLAR PRICE AND KEEP GLITCH FROM SLEEPING THIS APP, run this every 4.9 minutes
  //setInterval(stellarPriceCheck, 294000)
}