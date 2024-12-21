const express = require('express')
const registerUser = require('../controller/registerUser')
const checkEmail = require('../controller/checkEmail')
const checkPassword = require('../controller/checkPassword')
const userDetails = require('../controller/userDetails')
const logout = require('../controller/logout')
const updateUserInfo = require('../controller/updateUserInfo')
const searchUser = require('../controller/searchUser')
const sendOTP = require('../controller/sendOTP')
const resetPassword = require('../controller/resetPassword')
<<<<<<< Updated upstream
const getConversations = require('../controller/getConversation')
=======
const deleteConversation = require('../controller/deleteConversation')
const getConversations = require('../controller/getConversation')
const getMessages = require('../controller/getMessages')
>>>>>>> Stashed changes

const router = express.Router()

// user api
router.post('/register', registerUser)

//check userEmail
router.post('/email',checkEmail)

//checkPassword
router.post('/password',checkPassword)

//user-details
router.get('/user-details',userDetails)

//logout
router.get('/logout',logout)

//update user info
router.post('/update-user',updateUserInfo)

//seach User
router.post('/search-user',searchUser)

// sendOTP
router.post('/send-otp',sendOTP)

router.post('/reset-password',resetPassword)

router.delete('/delete-conversation', deleteConversation);
router.get('/conversations', getConversations);
router.get('/messages/:recipientId', getMessages);

router.get('/conversations', getConversations);


module.exports = router



