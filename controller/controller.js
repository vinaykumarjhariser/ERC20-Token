const bcrypt = require('bcrypt');
const request = require('request');
const Web3 = require('web3');
const mongoose = require('mongoose');
const web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`));
const abi = require('../abi/abi')
const contractAddress = "0xB452a338ba914B8855b23922Abb320f822C36F14";
const contract = new web3.eth.Contract(abi,contractAddress);
const Tx = require('ethereumjs-tx').Transaction;
const Details = require('../model/details')
const bodyParser = require('body-parser');

// TOTAL SUPPLY
exports.totalSupply = (req, res) => {
    contract.methods.totalSupply().call().then((result) => {
        res.status(200).json(result)
    }).catch((err) => {
        res.status(500).json(err)
    });   
}
// BALANCE
exports.balance =  (req, res) => {
    // const tokenOwner = req.body
    let senderAddress = req.body.senderAddress;
    contract.methods.balanceOf(senderAddress).call().then((result) => {
       res.status(200).json(result)
   }).catch((err) => {
    res.status(500).json(err)
   });
}

// TRANSFER
exports.transfer = async(req, res) => {
    const MainAccountAddress = req.body.MainAccountAddress; //from
    const toAddress = req.body.toAddress; //to
    const value = req.body.value;
    const MainAccountPrivateKey = req.body.MainAccountPrivateKey;
    
    let dbKey = await Details.findOne({from:req.body.MainAccountAddress});
    // res.status(200).json(dbKey.privateKey)
    if(!dbKey){
        res.status(400).json("Private key not found");
    }else{
        let isValid = bcrypt.compareSync(MainAccountPrivateKey, dbKey.privateKey); // true
        if(!isValid){
            res.status(400).json("Wrong Private Key!");
        }else{
            function TransferERC20Token(MainAccountAddress,MainAccountPrivateKey,toAddress, value) {
                return new Promise(function (resolve, reject) {
                    try {
                        web3.eth.getBlock("latest", false, (error, result) => {
                            var _gasLimit = result.gasLimit;
            
                            contract.methods.decimals().call().then(function (result) {
                                try {
                                    var decimals = result;
                                    let amount = parseFloat(value) * Math.pow(10, decimals);
                                    web3.eth.getGasPrice(function (error, result) {
                                        let _gasPrice = result;
                                        try {
                                            const privateKey = Buffer.from(MainAccountPrivateKey, 'hex')
                                            var _hex_gasLimit = web3.utils.toHex((_gasLimit + 1000000).toString());
                                            var _hex_gasPrice = web3.utils.toHex(_gasPrice.toString());
                                            var _hex_value = web3.utils.toHex(amount.toString());
                                            var _hex_Gas = web3.utils.toHex('60000');
            
                                            web3.eth.getTransactionCount(MainAccountAddress).then(
                                                nonce => {
                                                    var _hex_nonce = web3.utils.toHex(nonce); 
            
                                                    const rawTx =
                                                    {
                                                        nonce: _hex_nonce,
                                                        from: MainAccountAddress,
                                                        to: contractAddress,
                                                        gasPrice: _hex_gasPrice,
                                                        gasLimit: _hex_gasLimit,
                                                        gas: _hex_Gas,
                                                        value: '0x0',
                                                        data: contract.methods.transfer(toAddress, _hex_value).encodeABI()
                                                    };
            
                                                    const tx = new Tx(rawTx, { 'chain': 'ropsten' });
                                                    tx.sign(privateKey);
                                                    var serializedTx = '0x' + tx.serialize().toString('hex');
                                                    web3.eth.sendSignedTransaction(serializedTx.toString('hex'), function (err, hash) {
                                                        if (err) {
                                                            reject(err);
                                                        }
                                                        else {
                                                            resolve(hash);
                                                            console.log(hash)
                                                            res.status(200).json(rawTx);
                                                            const salt = bcrypt.genSaltSync(10);
                                                            const hashKey =bcrypt.hashSync(req.body.MainAccountPrivateKey, salt);
                                                            let transactionDetails = new Details({
                                                                from:rawTx.from,
                                                                to:rawTx.to,
                                                                value:rawTx.value,
                                                                data:rawTx.data,
                                                                hash:hash,
                                                                privateKey:hashKey
            
                                                            })
                                                             transactionDetails.save();
                                                        }
                                                    })
                                                });                                
                                        } catch (error) {
                                            reject(error);
                                        }
                                    });
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        });
                    } catch (error) {
                        reject(error);
                    }
                })
            }
            TransferERC20Token(MainAccountAddress,MainAccountPrivateKey,toAddress, value);  
        }
    } 
    }

//APPROVE
exports.approve = (req,res)=>{
    const delegate = req.body.delegate;
    const numTokens = req.body.numTokens;
    contract.methods.approve(delegate, numTokens).call().then((result) => {
        res.status(200).json(result)
    }).catch((err) => {
        res.status(500).json(err)
    });
}


//ALLOWANCE
exports.allowance = (req,res)=>{
    const owner = req.body.owner;
    const delegate = req.body.delegate;
    contract.methods.allowance(owner,delegate).call().then((result) => {
        res.status(200).json(result)
    }).catch((err) => {
        res.status(500).json(err)
    });
}

// TRANSFERFROM
exports.transferFrom = async(req,res)=>{
    const MainAccountAddress = req.body.MainAccountAddress; //from
    const toAddress = req.body.toAddress; //to
    const value = req.body.value;
    const MainAccountPrivateKey = req.body.MainAccountPrivateKey;
    
    let dbKey = await Details.findOne({from:req.body.MainAccountAddress});
    // res.status(200).json(dbKey.privateKey)
    if(!dbKey){
        res.status(400).json("Private key not found");
    }else{
        let isValid = bcrypt.compareSync(MainAccountPrivateKey, dbKey.privateKey); // true
        if(!isValid){
            res.status(400).json("Wrong Private Key!");
        }else{
            function TransferERC20Token(MainAccountAddress,MainAccountPrivateKey,toAddress, value) {
                return new Promise(function (resolve, reject) {
                    try {
                        web3.eth.getBlock("latest", false, (error, result) => {
                            var _gasLimit = result.gasLimit;
                            contract.methods.decimals().call().then(function (result) {
                                try {
                                    var decimals = result;
                                    let amount = parseFloat(value) * Math.pow(10, decimals);
                                    web3.eth.getGasPrice(function (error, result) {
                                        let _gasPrice = result;
                                        try {
                                            const privateKey = Buffer.from(MainAccountPrivateKey, 'hex')
                                            var _hex_gasLimit = web3.utils.toHex((_gasLimit + 1000000).toString());
                                            var _hex_gasPrice = web3.utils.toHex(_gasPrice.toString());
                                            var _hex_value = web3.utils.toHex(amount.toString());
                                            var _hex_Gas = web3.utils.toHex('60000');
            
                                            web3.eth.getTransactionCount(MainAccountAddress).then(
                                                nonce => {
                                                    var _hex_nonce = web3.utils.toHex(nonce); 
            
                                                    const rawTx =
                                                    {
                                                        nonce: _hex_nonce,
                                                        from: MainAccountAddress,
                                                        to: contractAddress,
                                                        gasPrice: _hex_gasPrice,
                                                        gasLimit: _hex_gasLimit,
                                                        gas: _hex_Gas,
                                                        value: '0x0',
                                                        data: contract.methods.transfer(toAddress, _hex_value).encodeABI()
                                                    };
                                                    console.log(rawTx)
                                                    const tx = new Tx(rawTx, { 'chain': 'ropsten' });
                                                    tx.sign(privateKey);
                                                    var serializedTx = '0x' + tx.serialize().toString('hex');
                                                    web3.eth.sendSignedTransaction(serializedTx.toString('hex'), function (err, hash) {
                                                        if (err) {
                                                            reject(err);
                                                        }
                                                        else {
                                                            resolve(hash);
                                                            console.log(hash)
                                                            res.status(200).json(rawTx);
                                                            const salt = bcrypt.genSaltSync(10);
                                                            const hashKey =bcrypt.hashSync(req.body.MainAccountPrivateKey, salt);
                                                            let transactionDetails = new Details({
                                                                from:rawTx.from,
                                                                to:rawTx.to,
                                                                value:rawTx.value,
                                                                data:rawTx.data,
                                                                hash:hash,
                                                                privateKey:hashKey
                                                            })
                                                             transactionDetails.save();
                                                        }
                                                    })
                                                });                                
                                        } catch (error) {
                                            reject(error);
                                        }
                                    });
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        });
                    } catch (error) {
                        reject(error);
                    }
                })
            }
            TransferERC20Token(MainAccountAddress,MainAccountPrivateKey,toAddress, value); 
        }
    }
}

// FIND ALL HISTORY FROM DB.
exports.getTransaction = async(req,res)=>{
    try{
        let trans =await Details.find({from:req.body.to});
        res.status(200).json(trans);
    }catch(err){
        res.status(400).json(err);
    }
}

//FIND ALL HISTORY FROM ETHERSCAN
exports.history = (req,res)=>{
    const address = req.body.address
    const API_KEY = 'XCW8YMKH67KDTW99NQA9ZWRGZYVXC448G4';
  request(`https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${API_KEY}`, function (error, response, body) {
  console.error('error:', error); // Print the error if one occurred
  let result = JSON.parse(body);
  console.log(result)
  res.status(200).json(result);
});
}
