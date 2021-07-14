const mysql = require('./sync-db');

/**
 * @author Fury
 * @date 6/22/2021
 * At W3 Etherem account, publicKey => address
 */
const Wallet = {}
Wallet.getWallet = (page, records, callback) => {
    let limit = ` LIMIT ${(page-1)*records}, ${records}`;
    var result;
    try{
        result = mysql.query('SELECT id, userId, address FROM users'+limit)
    }catch(e){
        callback(e, []);
    }
    callback(null, result);
}
Wallet.getWalletByUserID = (userId, callback) =>{
    var result;
    try{
        result = mysql.query('SELECT id, userId, address, secretKey FROM users WHERE userId = '+userId)
    }catch(e){
        callback(e, []);
    }
    callback(null, result);
}
Wallet.createWallet = (new_account, userId, callback) => {
    var sql = "SELECT COUNT(*) as count FROM users WHERE userId="+userId;
    var result;
    try{
        result = mysql.query(sql)
        console.log("Checking...")
        if(result[0].count>0){
            callback({status : 422}, result);
            return;
        }
        console.log("inserting...")
        sql = "INSERT INTO users ( userId, address, secretKey ) VALUES ( ?, ?, ? )";
        result = mysql.query(sql, [userId, new_account.address, new_account.privateKey]);
        callback(null, result);
    }catch(e){
        callback(e, []);
    }
}

module.exports = Wallet;