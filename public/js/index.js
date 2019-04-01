let destKeyElement = document.getElementById('destKey')
let sourceKeyIn = document.getElementById('sourceKeyIn')
let sendPaymentBtn = document.getElementById('sendPaymentBtn')
let xlmPrice = document.getElementById('xlmPrice')
let priceCheckBtn = document.getElementById('priceCheck')
let acctBalanceBtn = document.getElementById('accountBalanceCheck')
let acctBalanceDiv = document.getElementById('accountBalanceDiv')
let selectedCurrency = document.getElementById('selectedCurrency')
let selectedCurrencyDefault = document.getElementById('selectedCurrencyDefault')
let paymentAmount = document.getElementById('paymentAmount')
let publicKeyLabel = document.getElementById('publicKeyLabel')
let defaultPaymentBtn = document.getElementById('defaultPaymentAmountBtn')
let saveDefaultPaymentBtn = document.getElementById('defaultBtn')
let saveKeyInBrowserCheckbox = document.getElementById('saveKeyCheckbox')
let showOptionsDivBtn = document.getElementById('showOptionsDivBtn')
let clearKeyBtn = document.getElementById('clearKeyBtn')
let paymentStatusDiv = document.getElementById('paymentStatusDiv')


let stellarLedgerUrl = 'http://testnet.stellarchain.io/tx/'
//let host = 'https://love-button-stellar-app.herokuapp.com/api/'
let host = 'http://localhost:8080/api/'
let stellarPrice = ''

function checkXLM() {
    xlmPrice.innerText = 'loading'
    $.get(`${host}priceCheck`, function(price) {
        xlmPrice.innerText = `1 Stellar(XLM) is worth ${price.price} USD`
        stellarPrice = price.price
    })
}

if (localStorage.getItem("encryptedKey")) {
    console.log("loaded key")
    sourceKeyIn.value = "KEY STORED IN BROWSER"
} else {
    console.log("no key in localStorage")
}

checkXLM()

function loadDefaultBtn() {
    const defCur = localStorage.getItem("defaultCurrency")
    const defAmt = localStorage.getItem("defaultAmt")
    if (defCur && defAmt) {
        defaultPaymentBtn.innerHTML = `Default (${defAmt+defCur})`
    } else {
        defaultPaymentBtn.innerHTML = "Default (not set)"
    }
}

loadDefaultBtn()

defaultPaymentBtn.onclick =  function(e) {
    const defCur = localStorage.getItem("defaultCurrency")
    const defAmt = localStorage.getItem("defaultAmt")
    if (defCur && defAmt) {
        selectedCurrency.value = defCur
        paymentAmount.value = defAmt
    }
}

saveDefaultPaymentBtn.onclick = function(e) {
    localStorage.setItem("defaultCurrency", selectedCurrencyDefault.value)
    localStorage.setItem("defaultAmt", document.getElementById("defaultAmt").value)
    location.reload()
}

function validateAmount(amount) {
    if ((parseFloat(stellarPrice) * amount) <= 5.0) return true
    return false
}

showOptionsDivBtn.onclick = function(e) {
    document.getElementById("optionsDiv").style.display = "block"
}

clearKeyBtn.onclick = function(e) {
    localStorage.clear()
}

function sendPayment(amount) {
    if (amount <= 0) {
        alert("Can't send 0 or negative")
        return
    }
    if (!validateAmount(amount)) {
        alert("Max transaction size is 5$, if you want to send more, use the Stellar account viewer")
        return
    }
    const storedKey = localStorage.getItem("encryptedKey")
    console.log("storeKeyCheckbox: ",saveKeyInBrowserCheckbox.checked)
    $.post({url:`${host}sendMoney`,
        // get key from localStorage if its there
        data:{source: Boolean(storedKey) ? storedKey : sourceKeyIn.value, destination: destKeyElement.innerHTML, amount: amount,
            encryptKey: saveKeyInBrowserCheckbox.checked, keyEncrypted: Boolean(storedKey)},
        success: function(res) {
            paymentStatusDiv.innerHTML = `<p>Success, sent ${amount} XLM\nSee this transaction on Stellar public ledger: ${stellarLedgerUrl}${res.hash}</p>`
            if (res.encryptedKey) {
                console.log("server sent back an encrypted key, storing it")
                localStorage.setItem("encryptedKey", res.encryptedKey)
            } else {
                console.log("no key sent back with response")
            }
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
        var storedKey = localStorage.getItem("encryptedKey")
        $.post({
            url: `${host}accountBalance`,
            data: {source: Boolean(storedKey) ? storedKey : sourceKeyIn.value, keyEncrypted: Boolean(storedKey)},
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