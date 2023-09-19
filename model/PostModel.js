const mongoose = require('mongoose');

const postSchema = mongoose.Schema({

    title:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,

    },
    file:{
        type:String,
        require:true,
    },
    time:{
        type:String,
        default:new Date
    },
    email:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    profile:{
        type:String,
    }
},{
    timestamps:true,
})

module.exports = mongoose.model('Posts',postSchema);