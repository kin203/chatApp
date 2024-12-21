const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const { ConversationModel, MessageModel } = require("../models/ConversationModel");

async function getMessages(request, response) {
  try {
    const token = request.cookies.token || "";
    const { recipientId } = request.params;  // Lấy recipientId từ params

    // Lấy thông tin người dùng từ token
    const user = await getUserDetailsFromToken(token);
    if (!user) {
      return response.status(401).json({
        message: "Unauthorized: Invalid token",
        error: true,
      });
    }

    // Kiểm tra nếu recipientId không được cung cấp hoặc không hợp lệ
    if (!recipientId) {
      return response.status(400).json({
        message: "Recipient ID is required",
        error: true,
      });
    }

    // Tìm cuộc hội thoại giữa user và recipient
    const conversation = await ConversationModel.findOne({
      $or: [
        { sender: user._id, receiver: recipientId },
        { sender: recipientId, receiver: user._id },
      ],
    }).populate({
      path: 'messages',
      options: { sort: { createdAt: -1 }, limit: 20 },
    });

    if (!conversation) {
      return response.status(404).json({
        message: "Conversation not found",
        error: true,
      });
    }

    // Lấy tin nhắn trong cuộc hội thoại
    const messages = conversation.messages.reverse();  // Đảo lại thứ tự tin nhắn

    return response.status(200).json({
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "An error occurred",
      error: true,
    });
  }
}

module.exports = getMessages;
