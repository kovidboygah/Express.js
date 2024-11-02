// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3000;

// Replace with your MongoDB Atlas connection string
const uri = 'mongodb+srv://kovidboygah:Kovid10072002@cluster0.yzi5d.mongodb.net/lessonsdb';

// Connect to MongoDB Atlas
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Define a Lesson schema
const lessonSchema = new mongoose.Schema({
  subject: String,
  location: String,
  price: Number,
  spaces: Number,
});

// Create a model
const Lesson = mongoose.model('Lesson', lessonSchema);

app.use(cors()); // Enable CORS for requests from different origins
app.use(express.json());

// Get the list of lessons
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching lessons' });
  }
});

// Search for lessons
app.get('/search', async (req, res) => {
  const { query } = req.query; // Extract the search term from the query string
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Perform a case-insensitive search for lessons that match the query
    const lessons = await Lesson.find({
      subject: { $regex: query, $options: 'i' } // Regular expression for partial matches
    });

    res.json(lessons); // Return the filtered lessons
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while searching for lessons' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});