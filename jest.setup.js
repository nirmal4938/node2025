console.log('Jest setup file loaded');

require('dotenv').config();
const mongoose = require('mongoose');

beforeAll(async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
});

afterAll(async () => {
    console.log('Disconnecting from MongoDB...');
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
});
