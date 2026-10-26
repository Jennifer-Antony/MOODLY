
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Mood = require("./models/Mood");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Moodly server is running! 💗");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Moodly API is working!",
    status: "success",
  });
});

// CREATE a mood
app.post("/api/moods", async (req, res) => {
  try {
    const { mood, note } = req.body;

    if (!["Happy", "Calm", "Okay", "Sad", "Stressed"].includes(mood)) {
      return res.status(400).json({ message: "Please select a valid mood." });
    }

    if (note !== undefined && typeof note !== "string") {
      return res.status(400).json({ message: "Note must be text." });
    }

    const newMood = await Mood.create({
      mood,
      note: note || "",
    });

    res.status(201).json(newMood);
  } catch (error) {
    res.status(500).json({ message: "Could not save mood." });
  }
});

// READ all moods
app.get("/api/moods", async (req, res) => {
  try {
    const moods = await Mood.find().sort({ createdAt: -1 });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch moods." });
  }
});

// UPDATE a mood
app.put("/api/moods/:id", async (req, res) => {
  try {
    const { mood, note } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid mood ID." });
    }

    if (!["Happy", "Calm", "Okay", "Sad", "Stressed"].includes(mood)) {
      return res.status(400).json({ message: "Please select a valid mood." });
    }

    if (note !== undefined && typeof note !== "string") {
      return res.status(400).json({ message: "Note must be text." });
    }

    const updatedMood = await Mood.findByIdAndUpdate(
      req.params.id,
      { mood, note: note || "" },
      { new: true, runValidators: true }
    );

    if (!updatedMood) {
      return res.status(404).json({ message: "Mood not found." });
    }

    res.json(updatedMood);
  } catch (error) {
    res.status(500).json({ message: "Could not update mood." });
  }
});

// DELETE a mood
app.delete("/api/moods/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid mood ID." });
    }

    const deletedMood = await Mood.findByIdAndDelete(req.params.id);

    if (!deletedMood) {
      return res.status(404).json({ message: "Mood not found." });
    }

    res.json({ message: "Mood deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete mood." });
  }
});

// Start server after connecting to MongoDB
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas! 💗");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Moodly server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();
