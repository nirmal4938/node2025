require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the cors package
const { setupWebSocket } = require("./websocket/websocketServer");
const { setupMQTTClient } = require("./mqtt/mqttClient");
const { connectDB, createIndexes } = require("./database/configDB");
const deviceHistoryRoutes = require("./routes/deviceHistoryRoutes"); // Add this line
const routes = require("./routes/index");
// Create an Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all origins (or specify a specific origin as needed)
app.use(cors());

// cookie-parser
app.use(cookieParser());
// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", routes); // Add this line

// Create an HTTP server
const server = http.createServer(app);

// Setup WebSocket and MQTT
// const wss = setupWebSocket(server);
// const mqttClient = setupMQTTClient(wss);

// Start the server
server.listen(PORT, async () => {
  await connectDB();
  // await createIndexes()
  console.log(`Server is running on http://localhost:${PORT}`);
});
