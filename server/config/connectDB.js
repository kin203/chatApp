const mongoose =require('mongoose')

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGODB_URL)

        const connection =mongoose.connection

        connection.on('connected',()=>{
            console.log("COnnect to DB")
        })

        connection.on('error', (error)=>{
            console.log("Mongo loi ! "+error)
        })
    }catch(error){
        console.log("Something went wrong",error)
    }
}

module.exports = connectDB