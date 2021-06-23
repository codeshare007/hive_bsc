const express = require('express');
const Wallet = require('../models/wallet.model');
const router = express.Router();
const WalletModel = require('../models/wallet.model');

var Web3 = require('web3');
var Accounts = require('web3-eth-accounts');
var EthToken = require('./abis/Eth.json');

var web3 = new Web3(Web3.givenProvider || 'https://data-seed-prebsc-1-s1.binance.org:8545');
var accounts = new Accounts('https://data-seed-prebsc-1-s1.binance.org:8545');
var ethereum_address = "0x8BaBbB98678facC7342735486C851ABD7A0d17Ca";
// var ethereum_address = "0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378";

var contract = new web3.eth.Contract(EthToken, ethereum_address);

//Creating GET Router to fetch all the users details from the MySQL Database
const getWallet = (req, res) => {
    WalletModel.getWallet((err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            res.status(500).send("Error cannot get the row");
    })
}

//Creating GET Router to fetch all the users details from the MySQL Database
const getWalletBySessionID = (req, res) =>{
    WalletModel.getWalletBySessionID(req.params.sessionId, (err, rows, fields) => {
        if (!err && rows[0])
            res.send(rows);
        else
            res.status(500).send("Error cannot find the row");
    })
}

//Router to GET specific users public_key from user id the MySQL database
const getAdressBySessionID = (req, res)=>{
    Wallet.getWalletBySessionID(req.params.sessionId, (err, rows, fields) => {
        if (!err && rows[0])
            res.send(rows);
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
    let entropy = "HiveBSCEtheremNET";
    let new_account = web3.eth.accounts.create([entropy]);
    console.log("sessionId= ", req.params.sessionId)
    Wallet.createWallet(new_account, req.params.sessionId, (err, rows, fields) => {
        if (!err)
            res.status(200).send({ msg: "Success" });
        else if(err.status==422){
            console.log("Already Exists..");
            res.status(422).send({msg : `${req.params.sessionId} Already Exist..`});
        }
        else {
            console.log(err);
            res.status(500).send({ msg: "Error" });
        }

    });
}

//Router GET request it transfers the amount of tokens from one address to other
const transfer = (req, res) => {
    var amount = req.params.amount;
    WalletModel.getWalletBySessionID(req.params.from, (err, rows, fields) => {
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
                gas: 200000,
                // this encodes the ABI of the method and the arguements
                data: contract.methods.transfer(reciever_address, BigInt(amount * 10 ** 18)).encodeABI()
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
    var sessionId = req.params.sessionId;
    WalletModel.getWalletBySessionID( sessionId, async (err, rows, fields) => {
        if (!err && rows[0]) {
            address = rows[0].address;
            let balance = await contract.methods.balanceOf(address).call();
            console.log("Content balance is:", balance / 10 ** 18);
            res.send(String(balance / 10 ** 18));
        }
        else {
            res.status(500).send(err);
        }
    });
}

router.get('/', getWallet)
router.get('/detail/:sessionId', getWalletBySessionID)
router.get('/publickey/:sessionId', getAdressBySessionID)
router.post('/create/:sessionId', createWallet)
router.get('/transfer/:amount/:from/:to', transfer)
router.get('/balance/:sessionId', getBalance)

module.exports = router;
