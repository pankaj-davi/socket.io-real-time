require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());



mongoose.connect(process.env.MONGOURI, {
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
//   await TestCase.deleteMany({});
  await TestCase.insertMany([
   
  ]);
//   console.log('Dummy data created');
};

createDummyData();

// Emit data to clients
io.on('connection', (socket) => {
  console.log('New client connected');

  const sendTestCases = async () => {
    const testCases = await TestCase.find();
    socket.emit('FromAPI', testCases);
  };

  sendTestCases();
  setInterval(sendTestCases, 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
