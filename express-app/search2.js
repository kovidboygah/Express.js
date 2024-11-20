// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3000;

// MongoDB connection string
const uri = 'mongodb+srv://kovidboygah:Kovid10072002@cluster0.yzi5d.mongodb.net/lessonsdb';
let db;

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('lessonsdb');
    console.log('Connected to MongoDB Atlas');
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if connection fails
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use('/images', express.static(path.join(__dirname, 'images'), { fallthrough: true }));
app.use('/images', (req, res) => {
  res.status(404).json({ error: 'Image not found' });
});

app.get('/search', async (req, res) => {
    const { query } = req.query; // Single query parameter to search everything
    let dbQuery = {};

    if (query) {
        // Attempt to parse the query as a number
        const numericQuery = parseFloat(query);

        // If query is a valid number, treat it as numeric
        if (!isNaN(numericQuery)) {
            dbQuery = {
                $or: [
                    { price: { $lte: numericQuery } },  // Price should be less than or equal to the number
                    { spaces: numericQuery }  // Spaces should be exactly equal to the number
                ]
            };
        } else {
            // If the query is not a number, apply regex search to subject and location
            dbQuery = {
                $or: [
                    { subject: { $regex: query, $options: 'i' } }, // Case-insensitive match for subject
                    { location: { $regex: query, $options: 'i' } }  // Case-insensitive match for location
                ]
            };
        }
    }

    try {
        // Fetch lessons based on the query
        const lessons = await db.collection('lessons').find(dbQuery).toArray();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while searching for lessons' });
    }
});


  
// Routes for Lessons

// Get all lessons
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await db.collection('lessons').find().toArray();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching lessons' });
  }
});

// Get a specific lesson by ID
app.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(req.params.id) });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the lesson' });
  }
});

// Create a new lesson
app.post('/lessons', async (req, res) => {
  const { subject, location, price, spaces, imageUrl } = req.body;

  try {
    const newLesson = { subject, location, price, spaces, imageUrl };
    const result = await db.collection('lessons').insertOne(newLesson);
    res.status(201).json({ ...newLesson, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the lesson' });
  }
});

// Update a lesson
app.put('/lessons/:id', async (req, res) => {
  try {
    const updatedLesson = await db.collection('lessons').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updatedLesson.value) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(updatedLesson.value);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the lesson' });
  }
});

// Delete a lesson
app.delete('/lessons/:id', async (req, res) => {
  try {
    const deletedLesson = await db.collection('lessons').deleteOne({ _id: new ObjectId(req.params.id) });
    if (deletedLesson.deletedCount === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the lesson' });
  }
});

// Routes for Orders

// Get all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders').find().toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching orders' });
  }
});

// Get a specific order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the order' });
  }
});

// Create a new order
app.post('/orders', async (req, res) => {
  const { name, phone, lessonIDs, numberOfSpaces } = req.body;

  if (!name || !phone || !lessonIDs || !numberOfSpaces) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newOrder = { name, phone, lessonIDs, numberOfSpaces };
    const result = await db.collection('orders').insertOne(newOrder);
    res.status(201).json({ message: 'Order placed successfully', order: { ...newOrder, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
});

// Update an order
app.put('/orders/:id', async (req, res) => {
  try {
    const updatedOrder = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updatedOrder.value) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updatedOrder.value);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the order' });
  }
});

// Delete an order
app.delete('/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await db.collection('orders').deleteOne({ _id: new ObjectId(req.params.id) });
    if (deletedOrder.deletedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the order' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
