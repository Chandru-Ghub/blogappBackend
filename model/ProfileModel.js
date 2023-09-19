const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({

    username:{
        type:String,
        require:true,
    },
    bio:{
        type:String,
        require:true,

    },
    birth:{
        type:String,
        require:true,
    },
    file:{
        type:String,
        require:true,
        default: 'https://cdn-icons-png.flaticon.com/128/3237/3237472.png'
    },
    email:{
        type:String,
        require:true,
    },
    name:{
        type:String,
        require:true,
    }
},{
    timestamps:true,
})

module.exports = mongoose.model('Profile',profileSchema);