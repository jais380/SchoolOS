const mongoose = require("mongoose");
require("dotenv").config();

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestClass",
        required: true
    }
});

const TestClass = mongoose.model("TestClass", classSchema);
const TestStudent = mongoose.model("TestStudent", studentSchema);

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        // Remove old test data
        await TestClass.deleteMany({});
        await TestStudent.deleteMany({});

        // Create a class
        const newClass = await TestClass.create({
            name: "Grade 7"
        });

        // Create a student referencing that class
        const newStudent = await TestStudent.create({
            name: "John",
            classId: newClass._id
        });

        // Fetch student WITHOUT populate
        const studentWithoutPopulate = await TestStudent.findById(
            newStudent._id
        );

        console.log("\nWITHOUT POPULATE:");
        console.log(studentWithoutPopulate);

        // Fetch student WITH populate
        const studentWithPopulate = await TestStudent.findById(
            newStudent._id
        ).populate("classId");

        console.log("\nWITH POPULATE:");
        console.log(studentWithPopulate);

    } catch (error) {
        console.error("Test failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();