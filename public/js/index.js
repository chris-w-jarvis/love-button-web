let destKeyElement = document.getElementById('destKey')
let sourceKeyIn = document.getElementById('sourceKeyIn')
let sendPaymentBtn = document.getElementById('sendPaymentBtn')
let xlmPrice = document.getElementById('xlmPrice')
let priceCheckBtn = document.getElementById('priceCheck')
let acctBalanceBtn = document.getElementById('accountBalanceCheck')
let acctBalanceDiv = document.getElementById('accountBalanceDiv')
let selectedCurrency = document.getElementById('selectedCurrency')
let paymentAmount = document.getElementById('paymentAmount')
let publicKeyLabel = document.getElementById('publicKeyLabel')
let defaultPaymentBtn = document.getElementById('defaultPaymentAmountBtn')


let stellarLedgerUrl = 'http://testnet.stellarchain.io/tx/'
let host = 'https://love-button-stellar-app.herokuapp.com/api/'
let stellarPrice = ''

function checkXLM() {
    xlmPrice.innerText = 'loading'
    $.get(`${host}priceCheck`, function(price) {
        xlmPrice.innerText = `1 Stellar(XLM) is worth ${price.price} USD`
        stellarPrice = price.price
    })
}

checkXLM()

// function loadDefaultBtn() {
//     return new Promise((resolve, reject) => {
//         chrome.storage.sync.get(['defaultAmount'], function (res) {
//             if (res.defaultAmount) {
//                 var amt = res.defaultAmount
//                 chrome.storage.sync.get(['defaultCurrency'], function (resCur) {
//                     if (resCur.defaultCurrency) {
//                         resolve({defaultAmount: amt, defaultCurrency: resCur.defaultCurrency})
//                     } else resolve({defaultAmount: '.02', defaultCurrency: 'usd'})
//                 })
//             } else resolve({defaultAmount: '.02', defaultCurrency: 'usd'})
//         })
//     })
// }

// // set default button
// loadDefaultBtn().then((defaults) => {
//     if (defaults.defaultCurrency === 'usd') 
//         defaultPaymentBtn.innerText = `${parseFloat(defaults.defaultAmount).toFixed(2)}$`
//     else defaultPaymentBtn.innerText = `${parseFloat(defaults.defaultAmount).toFixed(2)}X`
// })

function sendPayment(amount) {
    if (amount <= 0) {
        alert("Can't send 0 or negative")
        return
    }
    $.post({url:`${host}sendMoney`,
        data:{source: sourceKeyIn.value, destination: destKeyElement.innerHTML, amount: amount},
        success: function(res) {
            alert(`Success, sent ${amount} XLM\nSee this transaction on Stellar public ledger: ${stellarLedgerUrl}${res.hash}`)
        },
        error: function() {
            alert('Request failed, check your private key.');
        }
    })
}

priceCheckBtn.onclick = function(e) {
    checkXLM()
}

acctBalanceBtn.onclick = function(e) {
    if (acctBalanceDiv.firstChild) acctBalanceDiv.removeChild(acctBalanceDiv.firstChild)
    if (sourceKeyIn.value != '') {
        $.post({
            url: `${host}accountBalance`,
            data: {source: sourceKeyIn.value},
            success: function (balance) {
                var usd = parseFloat(balance.balance) * parseFloat(stellarPrice)
                var xlm = parseFloat(balance.balance).toFixed(3)
                acctBalanceDiv.innerText = `Account balance: ${xlm} XLM which is ~${usd.toFixed(3)} USD`
            },
            error: function () {
                alert('Request failed, check your private key.');
            }
        })
    } else alert('Set source key to check balance (private key not public key)')
}

// More detailed error messaging, send error message to user from server (not enough money, etc)
sendPaymentBtn.onclick = function (e) {
    if (destKeyElement.innerHTML != 'No destination key on this page' && sourceKeyIn.value != '') {
        if (paymentAmount.value.match(/[a-z]/i) || !paymentAmount.value.match(/[0-9]/)) {
            alert('Numbers only and not empty')
            return
        }
        // determine amount
        if (selectedCurrency.value === 'usd') {
            var amount = parseFloat(paymentAmount.value) / parseFloat(stellarPrice)
            sendPayment(amount.toFixed(6).toString())
        } else {
            sendPayment(parseFloat(paymentAmount.value).toFixed(6).toString())
        }
    } else alert('Destination key or source key not set')
}