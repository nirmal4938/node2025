const mqtt = require('mqtt');
const fs = require('fs');
const { processPrimaryDevicesData } = require('../controllers/deviceHistoryController'); // Import processMqttMessage from the controller

function setupMQTTClient(wss) {
    const options = {
        host: 'localhost',
        port: 1883,
        protocol: 'mqtt',
        // key: fs.readFileSync('/path/to/client.key'),
        // cert: fs.readFileSync('/path/to/client.crt'),
        // ca: fs.readFileSync('/path/to/ca.crt'),
        rejectUnauthorized: true,
    };
    const mqttClient = mqtt.connect(options); // Adjust host/port as needed

    // MQTT Event: Connect to broker
    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');

        // Subscribe to topics for all devices in SCADA system
        const deviceTopics = [
            'devices/primary/#',
        ];

        deviceTopics.forEach((topic) => {
            mqttClient.subscribe(topic, (err) => {
                if (!err) {
                    console.log(`Subscribed to topic: ${topic}`);
                } else {
                    console.error(`MQTT Subscribe Error: ${err}`);
                }
            });
        });
    });

    // MQTT Event: Message Received
    mqttClient.on('message', async (topic, message) => {
        console.log("Raw Buffer message:", message); // Logs raw Buffer

        // Convert Buffer to string
        const stringMessage = message.toString();
        console.log("String message:", stringMessage);

        try {
            // Parse JSON string to object
            const parsedMessage = JSON.parse(stringMessage);
            console.log("Parsed message:", topic, parsedMessage);
            const topicPattern = /^devices\/primary(\/.*)?$/;
            // Call the controller method to save the message to the database
            if (topicPattern.test(topic))
                await processPrimaryDevicesData(message);

            // Broadcast to WebSocket clients
            // wss.clients.forEach((client) => {
            //     if (client.readyState === 1) { // WebSocket.OPEN
            //         client.send(JSON.stringify({ topic, message: parsedMessage }));
            //     }
            // });
        } catch (error) {
            console.error("Error parsing message:", error.message);
        }
    });

    wss.on('connection', (ws) => {
        ws.on('publishToMQTT', ({ topic, message }) => {
            try {
                // Ensure the payload is serialized as a JSON string
                const payload = typeof message === 'object' ? JSON.stringify(message) : String(message);

                console.log(`Preparing to publish to MQTT -> Topic: ${topic}, Payload: ${payload}`);

                // Publish the message to the MQTT broker
                mqttClient.publish(topic, payload, (err) => {
                    if (err) {
                        console.error(`MQTT Publish Error: ${err.message}`);
                    } else {
                        console.log(`Published to MQTT -> Topic: ${topic}, Payload: ${payload}`);
                    }
                });
            } catch (error) {
                console.error(`Error in publishToMQTT: ${error.message}`);
            }
        });
    });

    // Handle MQTT errors
    mqttClient.on('error', (error) => {
        console.error('MQTT Client Error:', error);
    });

    // Graceful MQTT client close on process exit
    process.on('SIGINT', () => {
        console.log('Disconnecting MQTT client...');
        mqttClient.end();
        process.exit();
    });

    return mqttClient;
}

module.exports = { setupMQTTClient };