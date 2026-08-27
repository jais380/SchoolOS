const dotenv = require("dotenv");
dotenv.config();
const dns = require("dns");
dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
])

const { app, connectDB } = require("./src/app");
const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.log(error.message);
    }
}

start();
