import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"

// Import hardcoded data
import thoughtsData from "./data/thoughts.json"

// Define the port - defaults to 8080 or uses environment variable
const port = process.env.PORT || 8080
const app = express()

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

// GET /thoughts - Return all thoughts
app.get("/thoughts", (req, res) => {
  res.json(thoughtsData)
})

// GET /thoughts/:id - Return a single thought by ID
app.get("/thoughts/:id", (req, res) => {
  const { id } = req.params
  const thought = thoughtsData.find((t) => t.id === id)
  
  if (thought) {
    res.json(thought)
  } else {
    res.status(404).json({ error: "Thought not found" })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
