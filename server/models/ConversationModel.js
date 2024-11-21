const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text : {
        type: String,
        default : ""
    },
    imageUrl : {
        type: String,
        default : ""
    },
    seen : {
        type: Boolean,
        default : false
    },
    videoUrl : {
        type : String,
        default : ""
    },
    msgByUserId : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    }
},{
    timestamps : true
})

const conversationSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.ObjectId,
        require : true,
        ref : 'User'
    },
    receiver : {
        type : mongoose.Schema.ObjectId,
        require : true,
        ref : 'User'
    },
    messages : [
        {
            type : mongoose.Schema.ObjectId,
             ref: 'MessageModel'
        }
    ]   
},{
    timestamps :true
})

const MessageModel = mongoose.model('MessageModel',messageSchema)
const ConversationModel = mongoose.model('ConversationModel',conversationSchema)

module.exports = {
    MessageModel,
    ConversationModel
}