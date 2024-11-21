const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken")
const UserModel = require("../models/UserModel")

async function updateUserInfo(request,response) {
    try {
        const token = request.cookies.token || ""

        const user = await getUserDetailsFromToken(token)
        
        const { name,profile_pic } = request.body

        const updateUser =await UserModel.updateOne({_id : user._id},{
            name,
            profile_pic
        })

        const userInformation = await UserModel.findById(user._id)

        return response.json({
            message : "update successfully",
            data: userInformation,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
    
}
module.exports = updateUserInfo