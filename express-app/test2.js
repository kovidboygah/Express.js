// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// MongoDB connection string
const uri = 'mongodb+srv://kovidboygah:Kovid10072002@cluster0.yzi5d.mongodb.net/lessonsdb';

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('MongoDB connection error:', error));

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

// Define Schemas and Models
const lessonSchema = new mongoose.Schema({
  subject: String,
  location: String,
  price: Number,
  spaces: Number,
  imageUrl: String
});
const Lesson = mongoose.model('Lesson', lessonSchema);

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  lessonIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  numberOfSpaces: { type: Number, required: true }
});
const Order = mongoose.model('Order', orderSchema);

// Routes for Lessons

// Get all lessons
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching lessons' });
  }
});

// Get a specific lesson by ID
app.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
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
    const newLesson = new Lesson({ subject, location, price, spaces, imageUrl });
    await newLesson.save();
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the lesson' });
  }
});

// Update a lesson
app.put('/lessons/:id', async (req, res) => {
  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the lesson' });
  }
});

// Delete a lesson
app.delete('/lessons/:id', async (req, res) => {
  try {
    const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!deletedLesson) {
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
    const orders = await Order.find().populate('lessonIDs');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching orders' });
  }
});

// Get a specific order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('lessonIDs');
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
    const newOrder = new Order({ name, phone, lessonIDs, numberOfSpaces });
    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
});

// Update an order
app.put('/orders/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the order' });
  }
});

// Delete an order
app.delete('/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
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
