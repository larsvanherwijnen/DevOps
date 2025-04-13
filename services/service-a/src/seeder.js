const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const products = [
  { name: "Product 1", price: 10.99 },
  { name: "Product 2", price: 15.49 },
  { name: "Product 3", price: 7.99 },
  { name: "Product 4", price: 25.0 },
  { name: "Product 5", price: 5.5 },
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected for seeding");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Existing products cleared");

    // Insert new products
    await Product.insertMany(products);
    console.log("Products seeded successfully");

    // Close the connection
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error("Error seeding products:", err);
    process.exit(1);
  }
}

seedProducts();