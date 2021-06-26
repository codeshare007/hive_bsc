const mysql = require('./db');

/**
 * @author Fury
 * @date 6/22/2021
 * At W3 Etherem account, publicKey => address
 */
const Wallet = {}
Wallet.getWallet = (callback) => {
    mysql.query('SELECT id, userId, address FROM users', (err, rows, fields) => {
        callback(err, rows, fields);
    });
}
Wallet.getWalletByuserId = (userId, callback) =>{
    mysql.query('SELECT id, userId, address, secretKey FROM users WHERE userId = ?', [userId], (err, rows, fields) => {
        callback(err, rows, fields);
    })
}
Wallet.createWallet = (new_account, userId, callback) => {
    var sql = "SELECT COUNT(*) as count FROM users WHERE userId="+userId;
    mysql.query(sql, (err, rows, fields)=>{
        console.log("Checking...")
        if(err)
            callback(err, rows, fields);
        if(rows[0].count>0){
            callback({status : 422}, rows, fields);
            return;
        }
        console.log("inserting...")
        sql = "INSERT INTO users ( userId, address, secretKey ) VALUES ( ?, ?, ? )";
        mysql.query(sql, [userId, new_account.address, new_account.privateKey], (err, rows, fields) => {
            callback(err, rows, fields);
        });
    });
}

module.exports = Wallet;