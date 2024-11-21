const admin = require("firebase-admin");

// Import service account key
const serviceAccount = require("./firebaseServiceAccount.json"); 

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chat-nk12.firebaseio.com", 
});

module.exports = admin;
