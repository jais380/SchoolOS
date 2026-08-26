const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const errorHandler = require("./middlewares/errorHandler.middleware");

const dotenv = require("dotenv");
const { tenantResolver } = require("./middlewares/tenantResolver.middleware");
dotenv.config();
const app = express();

//Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Health Check
app.get("/", (req, res) => {
    res.json({ message: "SchoolOS is running...s" })
});

//Routes
app.use(tenantResolver);
app.use('/api/super-admin', require('./routes/adminAuth.routes'));

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

app.use(errorHandler);

module.exports = { app, connectDB };
