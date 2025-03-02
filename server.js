require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the cors package
const session = require("express-session"); // Import express-session
const passport = require("passport"); // Import passport
const { setupWebSocket } = require("./websocket/websocketServer");
const { setupMQTTClient } = require("./mqtt/mqttClient");
const { connectDB, createIndexes } = require("./database/configDB");
const deviceHistoryRoutes = require("./routes/deviceHistoryRoutes"); // Add this line
const routes = require("./routes/index");
// Create an Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all origins (or specify a specific origin as needed)
const corsOptions = {
  origin: "https://lerna.onrender.com" || "http://localhost:3000", // Allow only this origin
  credentials: true, // Allow credentials (cookies, authorization headers)
};

app.use(cors(corsOptions));

// cookie-parser
app.use(cookieParser());
// Middleware to parse JSON
app.use(express.json());

// Session middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret", // Add a secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set secure cookie for production
      httpOnly: true, // Prevent JavaScript access to cookies
      maxAge: 3600000, // 1 hour expiry
    },
  })
);

// Initialize passport and passport session
app.use(passport.initialize());
app.use(passport.session());

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
