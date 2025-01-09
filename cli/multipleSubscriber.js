const { connectDB, createIndexes } = require('../database/configDB');
const DeviceHistory = require("../models/deviceHistoryModel");
const mqtt = require("mqtt");

const options = {
    host: "localhost",
    port: 1883,
    protocol: "mqtt",
};

const mqttClient = mqtt.connect(options);

(async () => {
    // Ensure database connection
    await connectDB();

    // MQTT Message handling
    mqttClient.on("message", async (topic, message) => {
        try {
            const parsedMessage = JSON.parse(message.toString());
            const newHistory = new DeviceHistory({
                device_id: parsedMessage.device_id,
                device_type: parsedMessage.device_type,
                timestamp: new Date(),
                metadata: parsedMessage.metadata || {},
                data: parsedMessage.data,
                logical_device_id: parsedMessage.logical_device_id
            });

            await newHistory.save();
            console.log("Saved to database:", newHistory);
        } catch (err) {
            console.error("Error processing message:", err.message);
        }
    });

    // Subscribe to topics
    const deviceTopics = ["devices/primary/#"];
    deviceTopics.forEach((topic) => {
        mqttClient.subscribe(topic, (err) => {
            if (err) {
                console.error(`Error subscribing to topic ${topic}:`, err.message);
            } else {
                console.log(`Subscribed to topic: ${topic}`);
            }
        });
    });
})();
