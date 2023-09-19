const mongoose = require('mongoose');
const CommentSchema = mongoose.Schema({

    comment:{
        type:String,
        require:true
    },
    id:{
        type:String,
        require:true
    },
    commentPerson:{
        type:String,
        require:true
    }
},{
    timeStamps:true
})

module.exports = mongoose.model('Comments',CommentSchema);