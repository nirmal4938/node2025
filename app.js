const express = require("express");
const cors = require("cors");

const app = express();
const port = 3100;

const corsOptions = {
  origin: "*", // Or specify the domains allowed to connect
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
// Serve Static Files
app.use(express.static("public"));
app.use("/assets", express.static("public"));

// template view engine
app.set("view engine", "ejs");

// Set the json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
const subscriberRouter = require("./routes/subscriber");
const publisherRouter = require("./routes/publisher");
const konvaRouter = require('./routes/konva');
const layoutRouter = require('./routes/layout')
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/subscriber", subscriberRouter);
app.use("/publisher", publisherRouter);
app.use("/konva", konvaRouter);
app.use("/layout", layoutRouter);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
