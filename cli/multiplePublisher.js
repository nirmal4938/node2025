const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

// MQTT broker connection settings
const options = {
    host: "localhost",
    port: 1883,
    protocol: "mqtt",
};

const mqttClient = mqtt.connect(options);

// JSON data file
const dataFilePath = path.join(__dirname, "deviceData.json");

// MQTT Event: Connect to the broker
mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");

    // Read device data from JSON file
    const deviceData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

    // Publish data for each device
    deviceData.forEach((device) => {
        const topic = `devices/primary/${device.deviceId}`;
        const message = JSON.stringify({
            device_id: device.device_id,
            device_type: device.device_type,
            timestamp: new Date(),
            metadata: device.metadata || {},
            data: device.data,
            logical_device_id: device.logical_device_id
        });

        mqttClient.publish(topic, message, (err) => {
            if (err) {
                console.error(`Error publishing to ${topic}: ${err.message}`);
            } else {
                console.log(`Published to ${topic}: ${message}`);
            }
        });
    });

    // Disconnect after publishing
    setTimeout(() => mqttClient.end(), 2000);
});
