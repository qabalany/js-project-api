import mongoose from "mongoose"

// Define the Thought schema
const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Message is required"],
    minlength: [5, "Message must be at least 5 characters"],
    maxlength: [140, "Message cannot exceed 140 characters"],
    trim: true
  },
  hearts: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Create the Thought model
const Thought = mongoose.model("Thought", ThoughtSchema)

export default Thought
