const jwt = require('jsonwebtoken')
const UserModel = require('../models/UserModel')

const getUserDetailsFromToken = async (token) => {  
    try {
        if (!token) {
            return {
                message: "Session out",
                error: true
            }
        }

        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await UserModel.findById(decode.id).select('-password')

        if (!user) {
            return {
                message: "User not found",
                error: true
            }
        }

        return user
    } catch (error) {
        return {
            message: error.message || error,
            error: true
        }
    }
}

module.exports = getUserDetailsFromToken
