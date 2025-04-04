require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse URL-encoded bodies (from form submissions)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(__dirname));

// Connect to MongoDB using mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define a schema for form submissions
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  submittedAt: { type: Date, default: Date.now }
});

// Create a model for form submissions
const FormSubmission = mongoose.model('FormSubmission', formSchema);

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// POST route to handle contact form submissions
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Save the form submission to the database
    const newSubmission = new FormSubmission({ name, email, message });
    await newSubmission.save();

    // Redirect to the success page
    res.redirect('/success.html');
  } catch (err) {
    console.error('Error saving form submission:', err);
    res.status(500).send('An error occurred while processing your request.');
  }
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
