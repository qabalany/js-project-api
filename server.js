import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Import hardcoded data (no longer needed - using MongoDB now)
// import thoughtsData from "./data/thoughts.json"

// Import Thought model
import Thought from "./models/Thought.js"

// Define the port - defaults to 8080 or uses environment variable
const port = process.env.PORT || 8080
const app = express()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error))

// Middlewares to enable CORS and JSON body parsing
app.use(cors())
app.use(express.json())

// Root endpoint - API documentation (auto-generated)
app.get("/", (req, res) => {
  res.json({ 
    message: "🌟 Welcome to Happy Thoughts API!",
    routes: listEndpoints(app)
  })
})

/* OLD manual documentation 
app.get("/", (req, res) => {
  res.json({ 
    message: "🌟 Welcome to Happy Thoughts API!",
    endpoints: {
      "/": "API documentation (you are here)",
      "/thoughts": "GET all thoughts",
      "/thoughts/:id": "GET a single thought by ID"
    }
  })
})
*/

// GET /thoughts - Return all thoughts from database
app.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await Thought.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(20) // Limit to 20 thoughts
    res.json(thoughts)
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch thoughts",
      message: error.message 
    })
  }
})

// GET /thoughts/:id - Return a single thought by ID from database
app.get("/thoughts/:id", async (req, res) => {
  try {
    const { id } = req.params
    const thought = await Thought.findById(id)
    
    if (thought) {
      res.json(thought)
    } else {
      res.status(404).json({ error: "Thought not found" })
    }
  } catch (error) {
    res.status(400).json({ 
      error: "Invalid thought ID",
      message: error.message 
    })
  }
})

// POST /thoughts - Create a new thought
app.post("/thoughts", async (req, res) => {
  try {
    const { message } = req.body
    
    // Create new thought
    const thought = new Thought({ message })
    
    // Save to database
    const savedThought = await thought.save()
    
    // Return created thought with 201 status
    res.status(201).json(savedThought)
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message)
      res.status(400).json({ 
        error: "Validation failed",
        messages: errors
      })
    } else {
      res.status(500).json({ 
        error: "Failed to create thought",
        message: error.message 
      })
    }
  }
})

// POST /thoughts/:id/like - Increment hearts count
app.post("/thoughts/:id/like", async (req, res) => {
  try {
    const { id } = req.params
    
    // Find thought and increment hearts by 1
    const thought = await Thought.findByIdAndUpdate(
      id,
      { $inc: { hearts: 1 } }, // Increment hearts by 1
      { new: true } // Return updated document
    )
    
    if (thought) {
      res.json(thought)
    } else {
      res.status(404).json({ error: "Thought not found" })
    }
  } catch (error) {
    res.status(400).json({ 
      error: "Failed to like thought",
      message: error.message 
    })
  }
})

// PUT /thoughts/:id - Update a thought's message
app.put("/thoughts/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body
    
    // Find and update thought with validation
    const thought = await Thought.findByIdAndUpdate(
      id,
      { message },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validation
      }
    )
    
    if (thought) {
      res.json(thought)
    } else {
      res.status(404).json({ error: "Thought not found" })
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message)
      res.status(400).json({ 
        error: "Validation failed",
        messages: errors
      })
    } else {
      res.status(400).json({ 
        error: "Failed to update thought",
        message: error.message 
      })
    }
  }
})

// DELETE /thoughts/:id - Delete a thought
app.delete("/thoughts/:id", async (req, res) => {
  try {
    const { id } = req.params
    
    const thought = await Thought.findByIdAndDelete(id)
    
    if (thought) {
      res.json({ 
        success: true,
        message: "Thought deleted successfully",
        deletedThought: thought
      })
    } else {
      res.status(404).json({ error: "Thought not found" })
    }
  } catch (error) {
    res.status(400).json({ 
      error: "Failed to delete thought",
      message: error.message 
    })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
