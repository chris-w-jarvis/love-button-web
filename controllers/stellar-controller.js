require('dotenv').config()
var StellarSdk = require('stellar-sdk');
var rp = require('request-promise')
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const sendPayment = function(privateSourceKey, destinationId, lumensAmount) {
  return new Promise((resolve, reject) => {
    var sourceKeys = StellarSdk.Keypair.fromSecret(privateSourceKey);
    // Transaction will hold a built transaction we can resubmit if the result is unknown.
    var transaction;

    // First, check to make sure that the destination account exists.
    // You could skip this, but if the account does not exist, you will be charged
    // the transaction fee when the transaction fails.
    server.loadAccount(destinationId)
    // If the account is not found, surface a nicer error message for logging.
    .catch(StellarSdk.NotFoundError, function (error) {
      throw new Error('The destination account does not exist!');
    })
    // If there was no error, load up-to-date information on your account.
    .then(function() {
      return server.loadAccount(sourceKeys.publicKey());
    })
    .then(function(sourceAccount) {
      // Start building the transaction.
      transaction = new StellarSdk.TransactionBuilder(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationId,
          // Because Stellar allows transaction in many currencies, you must
          // specify the asset type. The special "native" asset represents Lumens.
          asset: StellarSdk.Asset.native(),
          amount: lumensAmount
        }))
        // A memo allows you to add your own metadata to a transaction. It's
        // optional and does not affect how Stellar treats the transaction.
        .addMemo(StellarSdk.Memo.text('Test Transaction'))
        .build();
      // Sign the transaction to prove you are actually the person sending it.
      transaction.sign(sourceKeys);
      // And finally, send it off to Stellar!
      return server.submitTransaction(transaction);
    })
    .then(function(result) {
      resolve(result);
      // server.loadAccount(destinationId).then(function(account) {
      //   console.log('Balances for destination account: ' + destinationId);
      //   account.balances.forEach(function(balance) {
      //     console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
      //   });
      // });
      // server.loadAccount(sourceKeys.publicKey()).then(function(account) {
      //   console.log('Balances for source account: ' + sourceKeys.publicKey());
      //   account.balances.forEach(function(balance) {
      //     console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
      //   });
      // })
    })
    .catch(function(error) {
      reject(error);
      // If the result is unknown (no response body, timeout etc.) we simply resubmit
      // already built transaction:
      // server.submitTransaction(transaction);
    });
  })
}

const priceCheck = function() {
  return new Promise((resolve, reject) => {
    var options = {
      uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=XLM',
      headers: {
          'X-CMC_PRO_API_KEY': process.env.COIN_MKT_CAP_API_KEY
      },
      json: true // Automatically parses the JSON string in the response
    };
    rp(options)
      .then(function (res) {
          resolve(res.data.XLM.quote.USD.price);
      })
      .catch(function (err) {
          reject(err)
    });
  })
}

const accountBalance = function(privateSourceKey) {
  return new Promise((resolve, reject) => {
    var sourceKeys = StellarSdk.Keypair.fromSecret(privateSourceKey);
    server.loadAccount(sourceKeys.publicKey()).then(function(account) {
      account.balances.forEach(function(balance) {
        if (balance.asset_type === 'native') resolve(balance.balance)
      })
      // no stellar balance
      resolve('0')
    }).catch(err => reject(err))
  })
}

module.exports = {
  sendPayment: sendPayment,
  priceCheck: priceCheck,
  accountBalance: accountBalance
}
