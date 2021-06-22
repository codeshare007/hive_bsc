const mysql = require('./db');

/**
 * @author Fury
 * @date 6/22/2021
 * At W3 Etherem account, publicKey => address
 */
const Wallet = {}
Wallet.getWallet = (callback) => {
    mysql.query('SELECT id, sessionId, address FROM sessions', (err, rows, fields) => {
        callback(err, rows, fields);
    });
}
Wallet.getWalletBySessionID = (sessionId, callback) =>{
    mysql.query('SELECT id, sessionId, address, secretKey FROM sessions WHERE sessionId = ?', [sessionId], (err, rows, fields) => {
        callback(err, rows, fields);
    })
}
Wallet.createWallet = (new_account, sessionId, callback) => {
    var sql = "INSERT INTO sessions ( sessionId, address, secretKey ) VALUES ( ?, ?, ? )";
    mysql.query(sql, [sessionId, new_account.publicKey, new_account.privateKey], (err, rows, fields) => {
        callback(err, rows, fields);
    });
}

module.exports = Wallet;