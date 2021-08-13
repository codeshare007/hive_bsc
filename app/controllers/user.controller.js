const express = require('express');
const router = express.Router();
const UserModel = require('../models/user.model');

//Creating GET Router to fetch all the users details from the MySQL Database
const getWallet = (req, res) => {
    console.log(req.query);
    let page = req.query.page;
    let records = req.query.records;
    console.log(page, records)
    UserModel.getWallet(page, records, (err, rows) => {
        if (!err)
            res.send(rows);
        else
            res.status(500).send("Error cannot get the row");
    })
}
//Fetch users details including address - if not have address, create new one
const getUsersWallet = (req, res) => {
    console.log("GetUsers Wallet.....");

    let bnb_test = web3Conf.bnb_test;
    let web3 = bnb_test.web3;
    let entropy = bnb_test.entropy;
    try{
        let users = req.body.users;
        var result = [];
        for(var user of users){
            console.log(user);
            UserModel.getWalletByUserID(user, (err, rows) => {
                if (!err && rows[0]){
                    console.log("1...")
                    delete rows[0]['secretKey'];
                    result.push(rows[0]);
                }
                else{
                    console.log("2....")
                    var new_account = web3.eth.accounts.create([entropy]);
                    UserModel.createWallet(new_account, user, (err, rows) => {
                        if (!err){
                            result.push({userId : user, address : new_account.address});
                        }
                        else {
                            console.log(err);
                            res.status(500).send({ msg: "Error" });
                        }
                    });
                }
            })
        }
    }catch(e){
        res.send("can't parse Request...");
    }
    console.log(result)
    res.send(result);
}
//Creating GET Router to fetch all the users details from the MySQL Database
const getWalletByUserID = (req, res) =>{
    UserModel.getWalletByUserID(req.params.userId, (err, rows) => {
        console.log("getWalletByUserID....")
        console.log(rows);
        if (!err && rows[0]){
            delete rows[0]['secretKey'];
            res.send(rows);
        }
        else
            res.status(500).send("Error cannot find the row");
    })
}

//Router to GET specific users public_key from user id the MySQL database
const getAddressByUserID = (req, res)=>{
    UserModel.getWalletByUserID(req.params.userId, (err, rows) => {
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
    console.log("userId= ", req.params.userId)
    UserModel.createWallet(new_account, req.params.userId, (err, rows) => {
        if (!err)
            res.status(200).send({ msg: "Success" });
        else if(err.status==422){
            console.log("Already Exists..");
            res.status(422).send({msg : `User(${req.params.userId}) Already Exist..`});
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
    UserModel.getWalletByUserID(req.params.from, (err, rows) => {
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
    var userId = req.params.userId;
    UserModel.getWalletByUserID( userId, async (err, rows) => {
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
router.post('/wallet/getUsersWallet', getUsersWallet)
router.get('/wallet/:userId', getWalletByUserID)
router.get('/wallet/getAddress/:userId', getAddressByUserID)
router.post('/wallet/create/:userId', createWallet)
router.post('/wallet/transfer/:amount/:from/:to', transfer)
router.get('/wallet/balance/:userId', getBalance)

module.exports = router;
