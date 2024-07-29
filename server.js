require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path'); // Import path module

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Serve the main HTML file for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

mongoose.connect(process.env.MONGOURI, {
  serverSelectionTimeoutMS: 30000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Define TestCase schema and model
const testCaseSchema = new mongoose.Schema({
  name: String,
  status: { type: String, enum: ['pending', 'running', 'passed', 'failed'], default: 'pending' },
  logs: [String],
});

const TestCase = mongoose.model('TestCase', testCaseSchema);

// Create dummy test cases
const createDummyData = async () => {
  // await TestCase.deleteMany({});
  await TestCase.insertMany([
    // Add your dummy data here if needed
  ]);
  // console.log('Dummy data created');
};

createDummyData();

io.on('connection', (socket) => {
  console.log('New client connected');

  // Function to send test cases to clients
  const sendTestCases = async () => {
    const testCases = await TestCase.find();
    socket.emit('FromAPI', testCases);
  };

  // Send initial data to new clients
  sendTestCases();

  // Set up a change stream to listen for updates
  const changeStream = TestCase.watch();

  changeStream.on('change', (change) => {
    console.log('Change detected:', change);
    sendTestCases(); // Send updated data to clients
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    changeStream.close(); // Clean up the change stream on disconnect
  });
});

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
