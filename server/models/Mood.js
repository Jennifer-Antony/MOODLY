
const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    mood: {
      type: String,
      required: true,
      enum: ["Happy", "Calm", "Okay", "Sad", "Stressed"],
    },
    note: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Mood", moodSchema);
