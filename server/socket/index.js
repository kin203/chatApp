// const express  = require('express')
// const {Server} = require('socket.io')
// const http = require('http')
// const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
// const UserModel = require('../models/UserModel')
// const { ConversationModel, MessageModel } = require('../models/ConversationModel')
// const getConversation = require('../helpers/getConversation')

// const app = express()

// // socket connection
// const server = http.createServer(app)
// const io = new Server(server, {
//     cors : {
//         origin : process.env.FRONTEND_URL,
//         credentials : true
//     }
// })


// // online user
// const onlineUser = new Set()
// io.on('connection',async(socket)=>{
//     console.log("connected",socket.id)

//     const token = socket.handshake.auth.token

//     // current user
//     const user = await getUserDetailsFromToken(token)
//     console.log("user ", user)

//     socket.join(user?._id)
//     onlineUser.add(user?._id?.toString())

//     io.emit('onlineUser',Array.from(onlineUser))

//     socket.on('message-page',async(userId)=>{
//         console.log('userId',userId)
//         const userDetails = await UserModel.findById(userId).select("-password")

//         const payload= {
//             _id : userDetails?._id,
//             name : userDetails?.name,
//             email : userDetails?.email,
//             profile_pic : userDetails?.profile_pic,
//             online : onlineUser.has(userId)
//         }
//         socket.emit('message-user',payload)

//         const getConversationMessage = await ConversationModel.findOne({
//             "$or": [
//               { sender: user?._id, receiver: userId },
//               { sender: userId, receiver: user?._id },
//             ],
//           })
//             .populate({
//               path: 'messages',
//               options: { sort: { createdAt: -1 }, limit: 20 }
//             })

//         socket.emit('message',getConversationMessage?.messages || [])
//     })

//     //tin nhan moi
//     socket.on('new message',async(data)=>{

//         //check conversation is available both user

//         let conversation = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : data?.sender, receiver : data?.receiver },
//                 { sender : data?.receiver, receiver :  data?.sender}
//             ]
//         })

//         //if conversation is not available
//         if(!conversation){
//             const createConversation = await ConversationModel({
//                 sender : data?.sender,
//                 receiver : data?.receiver
//             })
//             conversation = await createConversation.save()
//         }
        
//         const message = new MessageModel({
//           text : data.text,
//           imageUrl : data.imageUrl,
//           videoUrl : data.videoUrl,
//           msgByUserId :  data?.msgByUserId,
//         })
//         const saveMessage = await message.save()

//         const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
//             "$push" : { messages : saveMessage?._id }
//         })

//         const getConversationMessage = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : data?.sender, receiver : data?.receiver },
//                 { sender : data?.receiver, receiver :  data?.sender}
//             ]
//         }).populate('messages').sort({ updatedAt : -1 })


//         // io.to(data?.sender).emit('message',getConversationMessage?.messages || [])
//         // io.to(data?.receiver).emit('message',getConversationMessage?.messages || [])

//         io.to(data?.sender).emit('message', saveMessage);
//         io.to(data?.receiver).emit('message', saveMessage);

//         //send conversation
//         const conversationSender = await getConversation(data?.sender)
//         const conversationReceiver = await getConversation(data?.receiver)

//         io.to(data?.sender).emit('conversation',conversationSender)
//         io.to(data?.receiver).emit('conversation',conversationReceiver)
//     })

//     // sidebar
//     socket.on('sidebar',async(currentUserId)=>{
//         console.log("current user",currentUserId)

//         const conversation = await getConversation(currentUserId)

//         socket.emit('conversation',conversation)
        
//     })

//     socket.on('seen',async(msgByUserId)=>{
        
//         let conversation = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : user?._id, receiver : msgByUserId },
//                 { sender : msgByUserId, receiver :  user?._id}
//             ]
//         })

//         const conversationMessageId = conversation?.messages || []

//         const updateMessages  = await MessageModel.updateMany(
//             { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
//             { "$set" : { seen : true }}
//         )

//         //send conversation
//         const conversationSender = await getConversation(user?._id?.toString())
//         const conversationReceiver = await getConversation(msgByUserId)

//         io.to(user?._id?.toString()).emit('conversation',conversationSender)
//         io.to(msgByUserId).emit('conversation',conversationReceiver)
//     })

//     // disconnect
//     socket.on('disconnect',()=>{
//         onlineUser.delete(user?._id)
//         console.log(socket.id)
//     })
// })

// module.exports={
//     app,
//     server
// }


const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();

// Tạo server HTTP và WebSocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Danh sách người dùng online
const onlineUsers = new Set();

io.on('connection', async (socket) => {
  console.log('Connected:', socket.id);

  // Lấy token từ handshake
  const token = socket.handshake.auth.token;
  let user;

  try {
    user = await getUserDetailsFromToken(token);
    if (!user) throw new Error('Invalid token');
  } catch (error) {
    console.error('Authentication failed:', error.message);
    socket.disconnect();
    return;
  }

  // Thêm user vào phòng riêng và danh sách online
  // socket.join(user?._id.toString());
  // onlineUsers.add(user._id.toString());
  // io.emit('onlineUser', Array.from(onlineUsers));

    if (user && user._id) {
      const userId = user._id.toString();
      socket.join(userId);
      onlineUsers.add(userId);
      io.emit('onlineUser', Array.from(onlineUsers));
  } else {
      console.error("User or user._id is undefined:", user);
      // Có thể xử lý thêm nếu cần, ví dụ:
      // socket.emit('error', { message: 'Invalid user data' });
  }

  console.log('User online:', user._id);

  // Xử lý sự kiện `message-page`
  socket.on('message-page', async (userId) => {
    try {
      const userDetails = await UserModel.findById(userId).select('-password');
      const payload = {
        _id: userDetails._id,
        name: userDetails.name,
        email: userDetails.email,
        profile_pic: userDetails.profile_pic,
        online: onlineUsers.has(userId.toString()),
      };
      socket.emit('message-user', payload);
  
      // Lấy tin nhắn gần nhất (giới hạn 20 tin nhắn)
      const conversation = await ConversationModel.findOne({
        $or: [
          { sender: user._id, receiver: userId },
          { sender: userId, receiver: user._id },
        ],
      })
        .populate({
          path: 'messages',
          options: { sort: { createdAt: -1 }, limit: 20 },
        });
  
      // Đảm bảo trả về mảng tin nhắn hợp lệ
      const messages = conversation?.messages ? conversation.messages.reverse() : [];
      socket.emit('message', messages);
    } catch (error) {
      console.error('Error in message-page:', error.message);
      socket.emit('error', 'Failed to load messages');
    }
  });

  // Xử lý tin nhắn mới
  socket.on('new message', async (data) => {
    try {
      const { sender, receiver, text, imageUrl, videoUrl, msgByUserId } = data;

      // Tìm hoặc tạo cuộc hội thoại
      let conversation = await ConversationModel.findOne({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      });

      if (!conversation) {
        conversation = await new ConversationModel({ sender, receiver }).save();
      }

      // Lưu tin nhắn
      const message = new MessageModel({ text, imageUrl, videoUrl, msgByUserId });
      const savedMessage = await message.save();

      // Cập nhật cuộc hội thoại
      await ConversationModel.updateOne(
        { _id: conversation._id },
        { $push: { messages: savedMessage._id } },
      );

      // Gửi tin nhắn mới cho cả người gửi và người nhận
      io.to(sender).emit('message', savedMessage);
      io.to(receiver).emit('message', savedMessage);

      // Cập nhật danh sách hội thoại
      const conversationSender = await getConversation(sender);
      const conversationReceiver = await getConversation(receiver);

      io.to(sender).emit('conversation', conversationSender);
      io.to(receiver).emit('conversation', conversationReceiver);
    } catch (error) {
      console.error('Error in new message:', error.message);
    }
  });

  // Xử lý đánh dấu tin nhắn đã đọc
  socket.on('seen', async (msgByUserId) => {
    try {
      const conversation = await ConversationModel.findOne({
        $or: [
          { sender: user._id, receiver: msgByUserId },
          { sender: msgByUserId, receiver: user._id },
        ],
      });

      if (conversation) {
        const messageIds = conversation.messages || [];
        await MessageModel.updateMany(
          { _id: { $in: messageIds }, msgByUserId, seen: false },
          { $set: { seen: true } },
        );

        const updatedSenderConversations = await getConversation(user._id.toString());
        const updatedReceiverConversations = await getConversation(msgByUserId);

        io.to(user._id.toString()).emit('conversation', updatedSenderConversations);
        io.to(msgByUserId).emit('conversation', updatedReceiverConversations);
      }
    } catch (error) {
      console.error('Error in seen:', error.message);
    }
  });

  // Xử lý sidebar
  socket.on('sidebar', async (currentUserId) => {
    try {
      const conversations = await getConversation(currentUserId);
      socket.emit('conversation', conversations);
    } catch (error) {
      console.error('Error in sidebar:', error.message);
    }
  });

  // Xử lý disconnect
  socket.on('disconnect', () => {
    onlineUsers.delete(user?._id.toString());
    io.emit('onlineUser', Array.from(onlineUsers));
    console.log('Disconnected:', socket.id);
  });
});

module.exports = {
  app,
  server,
};
