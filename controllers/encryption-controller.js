const CryptoJS = require("crypto-js")
require('dotenv').config()

const encryptKeyForBrowser = function(privateKey) {
    return CryptoJS.AES.encrypt(privateKey, process.env.SECRET_PHRASE).toString()
}

const decryptKeyFromBrowser = function(encryptedPrivateKey) {
    var bytes  = CryptoJS.AES.decrypt(encryptedPrivateKey.toString(), process.env.SECRET_PHRASE)
    return bytes.toString(CryptoJS.enc.Utf8)
}

module.exports = {
    encryptKeyForBrowser: encryptKeyForBrowser,
    decryptKeyFromBrowser: decryptKeyFromBrowser
}