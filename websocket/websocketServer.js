const WebSocket = require('ws');
const EventEmitter = require('events');

// Custom WebSocket class that extends both WebSocket and EventEmitter
class CustomWebSocket extends WebSocket {
    constructor(...args) {
        super(...args);
        // Add EventEmitter functionality
        EventEmitter.call(this);
    }
}

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server, clientConstructor: CustomWebSocket });

    // WebSocket Event: Client Connection
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');

        // Handle incoming messages from WebSocket clients
        ws.on('message', (data) => {
            try {
                // Parse incoming data
                const parsedData = JSON.parse(data);
                const { topic, message } = parsedData;

                // Validate required fields
                if (!topic || message === undefined) {
                    throw new Error('Invalid payload: "topic" and "message" are required.');
                }

                console.log(`WebSocket Message Received -> Topic: ${topic}, Message:`, message);

                // Emit custom event for MQTT publishing
                ws.emit('publishToMQTT', { topic, message });
            } catch (error) {
                console.error('Error processing WebSocket message:', error.message);
                ws.send(
                    JSON.stringify({
                        error: 'Invalid message format. Expected JSON with "topic" and "message".',
                    })
                );
            }
        });

        // Handle client disconnection
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });

        // Handle WebSocket errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error.message);
        });
    });


    return wss;
}

module.exports = { setupWebSocket };
