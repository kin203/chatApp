const { ConversationModel } = require('../models/ConversationModel');

async function deleteConversation(request, response) {
    try {
        const { senderId, receiverId } = request.body;

        if (!senderId || !receiverId) {
            return response.status(400).json({
                message: 'Missing senderId or receiverId',
                error: true,
            });
        }

        // Tìm và xóa cuộc hội thoại giữa senderId và receiverId
        const conversation = await ConversationModel.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (!conversation) {
            return response.status(404).json({
                message: 'Conversation not found',
                error: true,
            });
        }

        // Xóa tin nhắn trong cuộc hội thoại (nếu có)
        conversation.messages = [];

        // Lưu lại cuộc hội thoại với mảng tin nhắn đã bị xóa
        await conversation.save();

        // Xóa hoàn toàn cuộc hội thoại
        await ConversationModel.deleteOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        return response.json({
            message: 'Conversation and related messages deleted successfully',
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || 'Internal server error',
            error: true
        });
    }
}

module.exports = deleteConversation;
    