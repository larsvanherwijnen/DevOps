const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const dotenv = require("dotenv");
const cors = require("cors");
const { generateTrackingNumber } = require("../utils/trackingNumber");
const promBundle = require("express-prom-bundle");

const Tracking = require("./models/Tracking");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let channel;
const QUEUE_NAME = "order_created";

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected in Service B"))
  .catch(err => console.error("MongoDB connection error in Service B:", err));

async function connectRabbit() {
  const connection = await amqp.connect(`amqp://${process.env.MQ_USERNAME}:${process.env.MQ_PASSWORD}@${process.env.MQ_HOST}:${process.env.MQ_PORT}`);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  channel.consume(QUEUE_NAME, async (msg) => {
    const { orderId } = JSON.parse(msg.content.toString());
    console.log("Received order:", orderId);

    const tracking = new Tracking({ orderId, status: "Processing", trackingNumber: generateTrackingNumber() });
    await tracking.save();

    channel.ack(msg);
  });
}
connectRabbit();

const metricsMiddleware = promBundle({ 
  includePath: true,
  includeStatusCode: true,
  normalizePath: true,
  promClient: {
    collectDefaultMetrics: {},
  }
});
app.use(metricsMiddleware);

// GET /tracking/:orderId
app.get("/tracking/:orderId", async (req, res) => {
  const tracking = await Tracking.findOne({ orderId: req.params.orderId });
  if (!tracking) return res.status(404).json({ message: "Tracking not found" });
  res.json(tracking);
});


app.get("/tracking", async (req, res) => {
    try {
      const trackings = await Tracking.find();
      res.json(trackings);
    } catch (error) {
      console.error("Error fetching trackings:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });


app.post("/tracking", async (req, res) => {
try {
    const { orderId, status, trackingNumber } = req.body;

    // Validate required fields
    if (!orderId || !status || !trackingNumber) {
    return res.status(400).json({ message: "orderId, status, and trackingNumber are required" });
    }

    // Create and save the tracking record
    const tracking = new Tracking({ orderId, status, trackingNumber });
    await tracking.save();

    res.status(201).json({ message: "Tracking record created", tracking });
} catch (error) {
    console.error("Error creating tracking record:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
}
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Service B running on port ${PORT}`));
