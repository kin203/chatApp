// const admin = require("../firebase/firebase"); // Import Firebase đã cấu hình
// const nodemailer = require("nodemailer");
// const UserModel = require("../models/UserModel");

// // Cấu hình Nodemailer
// const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// async function sendOTP(request, response) {
//     try {
//         const { email } = request.body;

//         // Kiểm tra email tồn tại
//         const user = await UserModel.findOne({ email });
//         if (!user) {
//             return response.status(404).json({
//                 message: "Người dùng không tồn tại",
//                 error: true,
//             });
//         }

//         // Tạo OTP
//         const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo OTP 6 chữ số

//         // Tạo custom token với Firebase
//         const customToken = await admin.auth().createCustomToken(email, { otp });

//         // Gửi email chứa OTP
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: "Đặt lại mật khẩu - Mã OTP",
//             text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`,
//         };

//         await transporter.sendMail(mailOptions);

//         return response.status(200).json({
//             message: "Mã OTP đã được gửi đến email của bạn",
//             token: customToken, // Gửi token về client
//             success: true,
//         });
//     } catch (error) {
//         console.error("Error in sendOTP:", error);
//         return response.status(500).json({
//             message: error.message || "Có lỗi xảy ra",
//             error: true,
//         });
//     }
// }
// module.exports = sendOTP


// const admin = require("../firebase/firebase"); // Import Firebase đã cấu hình
// const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
// const UserModel = require("../models/UserModel");

// // Cấu hình OAuth2
// const oAuth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     "https://developers.google.com/oauthplayground" // Redirect URI
// );

// // Thiết lập token làm mới
// oAuth2Client.setCredentials({
//     refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// });

// // Hàm gửi OTP
// async function sendOTP(request, response) {
//     try {
//         const { email } = request.body;

//         // Kiểm tra email tồn tại
//         const user = await UserModel.findOne({ email });
//         if (!user) {
//             return response.status(404).json({
//                 message: "Người dùng không tồn tại",
//                 error: true,
//             });
//         }

//         // Tạo OTP
//         const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo OTP 6 chữ số

//         // Tạo custom token với Firebase
//         const customToken = await admin.auth().createCustomToken(email, { otp });

//         // Lấy access token từ Google OAuth2
//         const accessToken = await oAuth2Client.getAccessToken();
//         console.log(accessToken)

//         // try {
//         //     const accessToken = await oAuth2Client.getAccessToken();
//         // } catch (error) {
//         //     console.error("Error during OAuth2 token retrieval:", error.response?.data || error.message);
//         // }

//         // Cấu hình transporter với OAuth2
//         const transporter = nodemailer.createTransport({
//             service: "Gmail",
//             auth: {
//                 type: "OAuth2",
//                 user: process.env.EMAIL_USER,
//                 clientId: process.env.GOOGLE_CLIENT_ID,
//                 clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//                 refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//                 accessToken: accessToken.token, // Access token tự động lấy
//             },
//         });

//         // Gửi email chứa OTP
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: "Đặt lại mật khẩu - Mã OTP",
//             text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`,
//         };

//         await transporter.sendMail(mailOptions);

//         return response.status(200).json({
//             message: "Mã OTP đã được gửi đến email của bạn",
//             token: customToken, // Gửi token về client
//             success: true,
//         });
//     } catch (error) {
//         console.error("Error in sendOTP:", error);
//         return response.status(500).json({
//             message: error.message || "Có lỗi xảy ra",
//             error: true,
//         });
//     }
// }

// module.exports = sendOTP;
