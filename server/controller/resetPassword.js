const admin = require("../firebase/firebase");
const UserModel = require("../models/UserModel");
const bcryptjs = require("bcryptjs");

async function resetPassword(request, response) {
    try {
        const { email, otp, newPassword, token } = request.body;

        // Xác thực token từ Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (decodedToken.email !== email || decodedToken.otp !== otp) {
            return response.status(400).json({
                message: "OTP không hợp lệ hoặc đã hết hạn",
                error: true,
            });
        }

        // Kiểm tra user trong cơ sở dữ liệu
        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(404).json({
                message: "Người dùng không tồn tại",
                error: true,
            });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        // Cập nhật mật khẩu
        user.password = hashedPassword;
        await user.save();

        return response.status(200).json({
            message: "Mật khẩu đã được đặt lại thành công",
            success: true,
        });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return response.status(500).json({
            message: error.message || "Có lỗi xảy ra",
            error: true,
        });
    }
}

module.exports = resetPassword;
