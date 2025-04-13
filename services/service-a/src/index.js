const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const dotenv = require("dotenv");
const cors = require("cors");
const promBundle = require("express-prom-bundle");

const Product = require("./models/Product");
const Order = require("./models/Order");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let channel;
const QUEUE_NAME = "order_created";

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected in Service A"))
  .catch((err) => console.error("MongoDB connection error in Service A:", err));

// RabbitMQ Connection
async function connectRabbit() {
  const connection = await amqp.connect(
    `amqp://${process.env.MQ_USERNAME}:${process.env.MQ_PASSWORD}@${process.env.MQ_HOST}:${process.env.MQ_PORT}`
  );
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
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

// GET /products
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST /order
app.post("/order", async (req, res) => {
    console.log("Received request to create order:", req.body);

    try {
      const { productId, quantity } = req.body;
  
      if (!productId || !quantity) {
        return res.status(400).json({ message: "productId and quantity are required" });
      }
  
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
  
      const order = new Order({ productId, quantity });
      await order.save();
  
      if (!channel) {
        return res.status(500).json({ message: "RabbitMQ channel not initialized" });
      }
  
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify({ orderId: order._id }))
      );
  
      res.status(201).json({ message: "Order created", order });
    } catch (error) {
      console.error("Error in POST /order:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Service A running on port ${PORT}`));
