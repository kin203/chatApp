const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(request, response) {
  try {
    // Lấy token từ cookies
    const token = request.cookies.token || "";

    if (!token) {
      return response.status(401).json({
        message: "Token không được cung cấp!",
        error: true,
      });
    }

    // Giải mã token
    const user = await getUserDetailsFromToken(token);

    if (!user) {
      return response.status(401).json({
        message: "Token không hợp lệ hoặc đã hết hạn!",
        error: true,
      });
    }

    // Trả về thông tin user
    return response.status(200).json({
      message: "User details retrieved successfully!",
      data: user,
    });
  } catch (error) {
    console.error("Error in userDetails:", error.message);

    return response.status(500).json({
      message: "Đã xảy ra lỗi khi lấy thông tin người dùng!",
      error: true,
    });
  }
}

module.exports = userDetails;
