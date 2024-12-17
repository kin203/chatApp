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
    origin: process.env.FRONTEND_URL || '*',
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

    if (user && user._id) {
      const userId = user._id.toString();
      socket.join(userId);
      onlineUsers.add(userId);
      io.emit('onlineUser', Array.from(onlineUsers));
  } else {
      console.error("User or user._id is undefined:", user);
  }

  console.log('User online:', user._id);

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
  
{/* 
  // Xử lý gọi điện
  socket.on('call-user', (data) => {
    const { to, signal } = data;

    // Gửi tín hiệu WebRTC tới người nhận
    io.to(to).emit('incoming-call', {
      from: user._id, // ID người gọi
      signal,         // Tín hiệu WebRTC
    });
  });

  // Xử lý chấp nhận cuộc gọi
  socket.on('accept-call', (data) => {
    const { to, signal } = data;

    // Gửi tín hiệu WebRTC trở lại cho người gọi
    io.to(to).emit('call-accepted', {
      signal, // Tín hiệu WebRTC từ người nhận
    });
  });
*/ }

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
