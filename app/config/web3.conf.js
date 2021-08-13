

var Web3 = require('web3');

var eth_main = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
var eth_rinkby = "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
var bnb_main = "https://bsc-dataseed1.ninicoin.io";
var bnb_test = "https://data-seed-prebsc-1-s1.binance.org:8545/";

const entropy = "HiveBSCEtheremNET";
// var EthToken = require('../controllers/abis/Eth.json');
// var ethereum_address = "0x8BaBbB98678facC7342735486C851ABD7A0d17Ca";
// var contract = new web3.eth.Contract(EthToken, ethereum_address);
const web3Conf = {
    entropy : entropy,
    // contract : contract,
    bnb_test : {
        web3 : new Web3(Web3.givenProvider || bnb_test),
        gas : 200000
    },
    bnb_main : {
        web3 : new Web3(Web3.givenProvider || bnb_main),
        gas : 218000
    },
    eth_rinkby : {
        web3 : new Web3(Web3.givenProvider || eth_rinkby),
        gas : 200000
    },
    eth_main : {
        web3 : new Web3(Web3.givenProvider || eth_main),
        gas : 30000
    }
}

const provider = ['bnb_test', 'bnb_main', 'eth_rinkby', 'eth_main'];
const getWeb3ByRequest = (req) => {
    let web3Provider = "bnb_test";
    if(req.params.web3Provider)
        web3Provider = req.params.web3Provider;
    if(req.query.web3Provider)
        web3Provider = req.query.web3Provider;
    if(req.body.web3Provider)
        web3Provider = req.body.web3Provider;

    return provider.indexOf(web3Provider) !== -1 ? web3Conf[web3Provider] : web3Conf.bnb_test;
}
module.exports = web3Conf;
module.exports = getWeb3ByRequest;