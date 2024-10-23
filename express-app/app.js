// server.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Replace with your MongoDB Atlas connection string
const uri = 'mongodb+srv://kovidboygah:Kovid10072002@cluster0.mongodb.net/lessonsdb?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const lessonSchema = new mongoose.Schema({
  subject: String,
  location: String,
  price: Number,
  spaces: Number,
});

const Lesson = mongoose.model('Lesson', lessonSchema);

app.use(express.json());

// Search route to handle the request
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q; // Get the query parameter from the URL
    const results = await Lesson.find({
      subject: { $regex: query, $options: 'i' }, // Case-insensitive search
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
