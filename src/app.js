const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const dotenv = require("dotenv").config();
const app = express();

//Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Health Check
app.get("/", (req, res) => {
    res.json({ message: "SchoolOS is running...s" })
})

//Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected Successfully`);
    } catch(error) {
        console.log("MongoDB Connection Failed", error.message);
        process.exit(1);
    }
}

module.exports = { app, connectDB };
