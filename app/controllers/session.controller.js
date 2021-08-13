const express = require('express');
const { getWeb3ByRequest, web3Conf } = require('../config/web3.conf');
const router = express.Router();
const SessionModel = require('../models/session.model');

//Creating GET Router to fetch all the users details from the MySQL Database
const getWallet = (req, res) => {
    console.log(req.query);
    let page = req.query.page;
    let records = req.query.records;

    SessionModel.getWallet(page, records, (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            res.status(500).send("Error cannot get the row");
    })
}

//Creating GET Router to fetch all the users details from the MySQL Database
const getWalletBySessionID = (req, res) => {
    let bnb_test = web3Conf.bnb_test;
    let web3 = bnb_test.web3;
    let entropy = bnb_test.entropy;
    let sessionId = req.params.sessionId;

    SessionModel.getWalletBySessionID(sessionId, (err, rows, fields) => {
        console.log("getwalletbysessionid....")
        console.log(rows);
        if (!err && rows[0]){
            delete rows[0]['secretKey'];
            res.send(rows);
        }
        else if(rows.length === 0){
            var new_account = web3.eth.accounts.create([entropy]);
            SessionModel.createWallet(new_account, sessionId, (err, rows) => {
                if (!err){
                    res.send([{sessionId : sessionId, address : new_account.address}]);
                }
                else {
                    console.log(err);
                    res.status(500).send({ msg: "Error" });
                }
            });
        }
        else
            res.status(500).send("Error cannot find the row");
    })
}

//Router to GET specific users public_key from user id the MySQL database
const getAdressBySessionID = (req, res)=>{
    SessionModel.getWalletBySessionID(req.params.sessionId, (err, rows, fields) => {
        if (!err && rows[0])
            res.send({"address" : rows[0].address});
        else
            console.log(err);
        res.status(500).send("Error cannot find the row");
    })
}

/*
    *create - creates content account in BSC network
    *transfer - transfer eth to reciever from the sender
*/
//Router to get specific content account creation 
const createWallet = (req, res)=>{
    let bnb_test = web3Conf.bnb_test;
    let web3 = bnb_test.web3;
    let entropy = bnb_test.entropy;
    
    let new_account = web3.eth.accounts.create([entropy]);
    console.log("sessionId= ", req.params.sessionId)
    SessionModel.createWallet(new_account, req.params.sessionId, (err, rows, fields) => {
        if (!err)
            res.status(200).send({ msg: "Success" });
        else if(err.status==422){
            console.log("Already Exists..");
            res.status(422).send({msg : `Session(${req.params.sessionId}) Already Exist..`});
        }
        else {
            console.log(err);
            res.status(500).send({ msg: "Error" });
        }

    });
}

//Router GET request it transfers the amount of tokens from one address to other
const transfer = (req, res) => {
    let tmp = getWeb3ByRequest(req);
    let web3 = tmp.web3;
    let gas = tmp.gas;

    var amount = req.params.amount;
    SessionModel.getWalletBySessionID(req.params.from, (err, rows, fields) => {
        if (!err && rows[0]) {
            senders_private_key = String(rows[0].secretKey);
            var sender_account = web3.eth.accounts.privateKeyToAccount(senders_private_key);
            console.log(sender_account.address);
            //getting reciever's public key
            reciever_address = String(req.params.to);
            const tx = {
                // this could be provider.addresses[0] if it exists
                from: sender_account.address,
                // target address, this could be a smart contract address
                to: ethereum_address,
                // optional if you are invoking say a payable function 
                value: 0,
                //gas for transactios
                gas: gas,
                // this encodes the ABI of the method and the arguements
                // data: contract.methods.transfer(reciever_address, BigInt(amount * 10 ** 18)).encodeABI()
            };
            sender_account.signTransaction(tx).then((signedTx) => {
                const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
                sentTx.on("receipt", receipt => {
                    console.log("Transactions sent and receipt: ", receipt);
                    res.send("Success");
                });
                sentTx.on("error", err => {
                    console.log("Transactions sent error:", err);
                    res.status(500).send("Error", err);
                });
            })
                .catch((err) => {
                    console.log("Service failed sent error:", err);
                    res.status(500).send("Error Service Failed");
                });
        }
        else {
            console.log("Cannot find the sender", err);
            res.status(404).send("Error Cannot Find Sender address!");
        }
    });
}

//Router GET the content balance
const getBalance = (req, res) => {
    let tmp = getWeb3ByRequest(req);
    let web3 = tmp.web3;
    var sessionId = req.params.sessionId;
    SessionModel.getWalletBySessionID( sessionId, async (err, rows, fields) => {
        if (!err && rows[0]) {
            address = rows[0].address;
            let balance = await web3.eth.getBalance(address);
            console.log("Content balance is:", balance / 10 ** 18);
            res.send(String(balance / 10 ** 18));
        }
        else {
            res.status(500).send(err);
        }
    });
}

router.get('/wallet/', getWallet)
router.get('/wallet/:sessionId', getWalletBySessionID)
router.get('/wallet/getAddress/:sessionId', getAdressBySessionID)
router.post('/wallet/create/:sessionId', createWallet)
router.post('/wallet/transfer/:amount/:from/:to', transfer)
router.get('/wallet/balance/:sessionId', getBalance)

module.exports = router;
