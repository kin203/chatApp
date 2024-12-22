<<<<<<< Updated upstream
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const getConversation = require("../helpers/getConversation");

async function getConversations(request, response) {
  try {
    const token = request.cookies.token || "";

    // Lấy thông tin người dùng từ token
    const user = await getUserDetailsFromToken(token);
    if (!user) {
      return response.status(401).json({
        message: "Unauthorized: Invalid token",
        error: true,
      });
    }

    // Lấy danh sách hội thoại của người dùng
    const conversations = await getConversation(user._id);

    return response.status(200).json({
      message: "Conversations fetched successfully",
      data: conversations,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "An error occurred",
      error: true,
    });
  }
}

module.exports = getConversations;
=======
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const getConversation = require("../helpers/getConversation");

async function getConversations(request, response) {
  try {
    const token = request.cookies.token || "";

    // Lấy thông tin người dùng từ token
    const user = await getUserDetailsFromToken(token);
    if (!user) {
      return response.status(401).json({
        message: "Unauthorized: Invalid token",
        error: true,
      });
    }

    // Lấy danh sách hội thoại của người dùng
    const conversations = await getConversation(user._id);

    return response.status(200).json({
      message: "Conversations fetched successfully",
      data: conversations,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "An error occurred",
      error: true,
    });
  }
}

module.exports = getConversations;
>>>>>>> Stashed changes
