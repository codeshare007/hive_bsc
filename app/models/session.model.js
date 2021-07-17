const mysql = require('./async-db');

/**
 * @author Fury
 * @date 6/22/2021
 * At W3 Etherem account, publicKey => address
 */
const Wallet = {}
Wallet.getWallet = (page, records, callback) => {
    let limit = ` LIMIT ${(page-1)*records}, ${records}`;
    mysql.query('SELECT id, sessionId, address FROM sessions ORDER BY sessionId '+limit, (err, rows, fields) => {
        callback(err, rows, fields);
    });
}
Wallet.getWalletBySessionID = (sessionId, callback) =>{
    mysql.query('SELECT id, sessionId, address, secretKey FROM sessions WHERE sessionId = ?', [sessionId], (err, rows, fields) => {
        callback(err, rows, fields);
    })
}
Wallet.createWallet = (new_account, sessionId, callback) => {
    var sql = "SELECT COUNT(*) as count FROM sessions WHERE sessionId="+sessionId;
    mysql.query(sql, (err, rows, fields)=>{
        console.log("Checking...")
        console.log(rows[0].count)
        if(rows[0].count>0){
            callback({status : 422}, rows, fields);
            return;
        }
        console.log("inserting...")
        sql = "INSERT INTO sessions ( sessionId, address, secretKey ) VALUES ( ?, ?, ? )";
        mysql.query(sql, [sessionId, new_account.address, new_account.privateKey], (err, rows, fields) => {
            callback(err, rows, fields);
        });
    });
}

module.exports = Wallet;