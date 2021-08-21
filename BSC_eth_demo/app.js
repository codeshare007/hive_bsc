const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');

var Web3 = require('web3');

var eth_main = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
var eth_rinkby = "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
var bnb_main = "https://bsc-dataseed1.ninicoin.io";
var bnb_test = "https://data-seed-prebsc-1-s1.binance.org:8545/";

var web3 = new Web3(bnb_test);


var app = express();
const router = express.Router();
const path = require('path');

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//MySQL details
var mysqlConnection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'blade',
    database: 'ethereum_db',
    multipleStatements: true
});

//connect to mysql
mysqlConnection.connect((err) => {
    if (!err)
        console.log('Connection Established Successfully');
    else
        console.log('Connection Failed!' + JSON.stringify(err, undefined, 2));
});

//Establish the server connection
//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));


//Creating GET Router to fetch all the users details from the MySQL Database
app.get('/contents', urlencodedParser, (req, res) => {
    mysqlConnection.query('SELECT id, public_key, content_name FROM new_table', (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            res.status(500).send("Error cannot get the row");
    })
});

//Creating GET Router to fetch all the users details from the MySQL Database
app.get('/contents/detail/:id', urlencodedParser, (req, res) => {
    mysqlConnection.query('SELECT id, public_key, user_name, email FROM new_table WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err && rows[0])
            res.send(rows);
        else
            res.status(500).send("Error cannot find the row");
    })
});

//Router to GET specific users public_key from user id the MySQL database
app.get('/contents/publickey/:id', urlencodedParser, (req, res) => {
    mysqlConnection.query('SELECT public_key FROM new_table WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err && rows[0])
            res.send(rows);
        else
            console.log(err);
        res.status(500).send("Error cannot find the row");
    })
});

/*
    *create - creates content account in BSC network
    *transfer - transfer eth to reciever from the sender
*/
//Router to get specific content account creation 
app.get('/contents/create/:content_name', urlencodedParser, (req, res) => {
    let entropy = "hello";
    let new_account = web3.eth.accounts.create([entropy]);

    var sql = "INSERT INTO new_table ( public_key, private_key, content_name ) VALUES ( ?, ?, ? )";
    mysqlConnection.query(sql, [new_account.address, new_account.privateKey, req.params.content_name], (err, rows, fields) => {
        if (!err)
            res.status(200).send({ msg: "Success" });
        else {
            console.log(err);
            res.status(500).send({ msg: "Error" });
        }

    });
});

//Router GET request it transfers the amount of tokens from one address to other
app.get('/contents/transfer/:amount/:from/:to', urlencodedParser, (req, res) => {
    var amount = req.params.amount;
    mysqlConnection.query('SELECT private_key FROM new_table WHERE id = ?', [req.params.from], (err, rows, fields) => {
        if (!err && rows[0]) {
            senders_private_key = String(rows[0].private_key);
            var sender_account = web3.eth.accounts.privateKeyToAccount(senders_private_key);
            console.log(sender_account.address);
            //getting reciever's public key
            reciever_address = String(req.params.to);
            const tx = {
                // this could be provider.addresses[0] if it exists
                from: sender_account.address,
                // target address, this could be a smart contract address
                to: reciever_address,
                // optional if you are invoking say a payable function 
                value: web3.utils.toWei(amount, "ether"),
                //gas for transactios
                gas: 200000,
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
                    res.status(500).send(err);
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
});

//Router GET request it transfers the amount of main Eth tokens from one address to other
app.get('/contents/transfer/ethmainnet/:amount/:from/:to', urlencodedParser, (req, res) => {
    var amount = req.params.amount;
    let _web3 = new Web3(eth_main);

    mysqlConnection.query('SELECT private_key FROM new_table WHERE id = ?', [req.params.from], (err, rows, fields) => {
        if (!err && rows[0]) {
            senders_private_key = String(rows[0].private_key);
            var sender_account = _web3.eth.accounts.privateKeyToAccount(senders_private_key);
            console.log(sender_account.address);
            //getting reciever's public key
            reciever_address = String(req.params.to);
            const tx = {
                // this could be provider.addresses[0] if it exists
                from: sender_account.address,
                // target address, this could be a smart contract address
                to: reciever_address,
                // optional if you are invoking say a payable function 
                value: _web3.utils.toWei(amount, "ether"),
                //gas for transactios
                gas: 30000,
                // this encodes the ABI of the method and the arguements
                // data: contract.methods.transfer(reciever_address, BigInt(amount * 10 ** 18)).encodeABI()
            };
            sender_account.signTransaction(tx).then((signedTx) => {
                const sentTx = _web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
                sentTx.on("receipt", receipt => {
                    console.log("Transactions sent and receipt: ", receipt);
                    res.send("Success");
                });
                sentTx.on("error", err => {
                    console.log("Transactions sent error:", err);
                    res.status(500).send(err);
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
});

//Router GET request it transfers the amount of testnet Eth tokens from one address to other
app.get('/contents/transfer/ethtestnet/:amount/:from/:to', urlencodedParser, (req, res) => {
    var amount = req.params.amount;
    let _web3 = new Web3(eth_rinkby);

    mysqlConnection.query('SELECT private_key FROM new_table WHERE id = ?', [req.params.from], (err, rows, fields) => {
        if (!err && rows[0]) {
            senders_private_key = String(rows[0].private_key);
            var sender_account = _web3.eth.accounts.privateKeyToAccount(senders_private_key);
            console.log(sender_account.address);
            //getting reciever's public key
            reciever_address = String(req.params.to);
            const tx = {
                // this could be provider.addresses[0] if it exists
                from: sender_account.address,
                // target address, this could be a smart contract address
                to: reciever_address,
                // optional if you are invoking say a payable function 
                value: _web3.utils.toWei(amount, "ether"),
                //gas for transactios
                gas: 200000,
                // this encodes the ABI of the method and the arguements
                // data: contract.methods.transfer(reciever_address, BigInt(amount * 10 ** 18)).encodeABI()
            };
            sender_account.signTransaction(tx).then((signedTx) => {
                const sentTx = _web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
                sentTx.on("receipt", receipt => {
                    console.log("Transactions sent and receipt: ", receipt);
                    res.send("Success");
                });
                sentTx.on("error", err => {
                    console.log("Transactions sent error:", err);
                    res.status(500).send(err);
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
});

//Router GET request it transfers the amount of main BNB tokens from one address to other
app.get('/contents/transfer/bnbmainnet/:amount/:from/:to', urlencodedParser, (req, res) => {
    var amount = req.params.amount;
    let _web3 = new Web3(bnb_main);

    mysqlConnection.query('SELECT private_key FROM new_table WHERE id = ?', [req.params.from], (err, rows, fields) => {
        if (!err && rows[0]) {
            senders_private_key = String(rows[0].private_key);
            var sender_account = _web3.eth.accounts.privateKeyToAccount(senders_private_key);
            console.log(sender_account.address);
            //getting reciever's public key
            reciever_address = String(req.params.to);
            const tx = {
                // this could be provider.addresses[0] if it exists
                from: sender_account.address,
                // target address, this could be a smart contract address
                to: reciever_address,
                // optional if you are invoking say a payable function 
                value: _web3.utils.toWei(amount, "ether"),
                //gas for transactios
                gas: 218000,
                // this encodes the ABI of the method and the arguements
                // data: contract.methods.transfer(reciever_address, BigInt(amount * 10 ** 18)).encodeABI()
            };
            sender_account.signTransaction(tx).then((signedTx) => {
                const sentTx = _web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
                sentTx.on("receipt", receipt => {
                    console.log("Transactions sent and receipt: ", receipt);
                    res.send("Success");
                });
                sentTx.on("error", err => {
                    console.log("Transactions sent error:", err);
                    res.status(500).send(err);
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
});



//Router GET the content testnet BNB balance
app.get('/contents/balance/bnb-test/:id', urlencodedParser, (req, res) => {
    var id = req.params.id;
    mysqlConnection.query('SELECT public_key FROM new_table WHERE id = ?', [id], async (err, rows, fields) => {
        if (!err && rows[0]) {
            address = rows[0].public_key;
            let balance = await web3.eth.getBalance(address);
            console.log("Content test bnb balance is:", balance / 10 ** 18);
            res.send(String(balance / 10 ** 18));
        }
        else {
            res.status(500).send(err);
        }
    });
});

//Router GET the content mainnet BNB balance 
app.get('/contents/balance/bnb-mainnet/:id', urlencodedParser, (req, res) => {
    var id = req.params.id;
    let _web3 = new Web3(bnb_main);

    mysqlConnection.query('SELECT public_key FROM new_table WHERE id = ?', [id], async (err, rows, fields) => {
        if (!err && rows[0]) {
            address = rows[0].public_key;
            let balance = await _web3.eth.getBalance(address);
            console.log("Content main bnb balance is:", balance / 10 ** 18);
            res.send(String(balance / 10 ** 18));
        }
        else {
            res.status(500).send(err);
        }
    });
});

//Router GET the content Eth balance 
app.get('/contents/balance/eth-mainnet/:id', urlencodedParser, (req, res) => {
    var id = req.params.id;
    let _web3 = new Web3(eth_main);

    mysqlConnection.query('SELECT public_key FROM new_table WHERE id = ?', [id], async (err, rows, fields) => {
        if (!err && rows[0]) {
            address = rows[0].public_key;
            let balance = await _web3.eth.getBalance(address);
            console.log("Content main eth balance is:", balance / 10 ** 18);
            res.send(String(balance / 10 ** 18));
        }
        else {
            res.status(500).send(err);
        }
    });
});

//Router GET the content test net Eth balance 
app.get('/contents/balance/eth-testnet/:id', urlencodedParser, (req, res) => {
    var id = req.params.id;
    let _web3 = new Web3(eth_rinkby);

    mysqlConnection.query('SELECT public_key FROM new_table WHERE id = ?', [id], async (err, rows, fields) => {
        if (!err && rows[0]) {
            address = rows[0].public_key;
            let balance = await _web3.eth.getBalance(address);
            console.log("Content test eth balance is:", balance / 10 ** 18);
            res.send(String(balance / 10 ** 18));
        }
        else {
            res.status(500).send(err);
        }
    });
});

app.get('/home', function (req, res) {
    // res.sendFile(String(index_html));
    res.sendFile(path.join(__dirname + '/index.html'));

});
