const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Erc20', {
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(function () {
    console.log("MongoDb connected Successfully");
}).catch(function () {
    console.log("Connection Fail");
})
const ercSchema = new mongoose.Schema({
    from: {
        type: String,
    },
    to: {
        type: String,
    },
    value: {
        type: String,
    },
    data: {
        type: String,
    },
    hash: {
        type: String,
    },
    privateKey:{
        type:String,
        required:true
    }
});

let  ERC20  =  mongoose.model("ERC20", ercSchema);
module.exports  = ERC20;