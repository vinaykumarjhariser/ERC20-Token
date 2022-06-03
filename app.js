const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
app.use(express.json());
const controller = require('./controller/controller')

//TOTAL SUPPLY
app.get('/totalSupply',controller.totalSupply )

//BALANCE 
app.get('/balanceOf',controller.balance); 

// TRANSFER
app.post('/transfer',controller.transfer)

//APPROVE
app.get('/approve',controller.approve)

//ALLOWANCE
app.get('/allowance',controller.allowance)

// TRANSFERFROM
app.post('/transferFrom',controller.transferFrom)

// FIND ALL HISTORY FROM DB.
app.get('/getTransaction',controller.getTransaction)

//FIND ALL HISTORY FROM ETHERSCAN
app.get('/history',controller.history)


app.listen(port, () => {
    console.log(`app is Running on ${port}`)
})