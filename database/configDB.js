const mongoose = require("mongoose");

let uri =
    "mongodb+srv://nirmal_mongo_db:lIVAxqEqVue786eP@lms.hgumitz.mongodb.net/iot-1?retryWrites=true&w=majority&appName=lms";

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        const con = await mongoose.connect(uri);
        console.log(`Connected mongoose ${con.connection.host}`);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
};

// Function to create the time-series collection
// const createTimeSeriesCollection = async () => {
//     try {
//         const collections = await mongoose.connection.db.listCollections({ name: "deviceHistory" }).toArray();

//         if (collections.length === 0) {
//             await mongoose.connection.createCollection("deviceHistory", {
//                 timeSeries: {
//                     timeField: "timestamp",
//                     metaField: "metadata", // Device-specific metadata
//                     granularity: "seconds",
//                 },
//             });
//             console.log("Time-series collection created successfully!");
//         } else {
//             console.log("Time-series collection already exists.");
//         }
//     } catch (error) {
//         console.error("Error creating time-series collection:", error);
//     }
// };

const createIndexes = async () => {
    try {
        const collection = mongoose.connection.db.collection('devicehistories');
        await collection.createIndex({ timestamp: 1 }); // Ascending index on timestamp
        console.log('Index created for timestamp.');
    } catch (error) {
        console.error('Error creating index:', error);
    }
};

module.exports = { connectDB, createIndexes };
