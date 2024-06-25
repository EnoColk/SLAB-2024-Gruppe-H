const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const WebSocket = require('ws');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/onlinecompiler', {});

// User Model
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', UserSchema);

// Code Model
const CodeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  language: String,
  code: String,
  output: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

const Code = mongoose.model('Code', CodeSchema);

// Comment Model
const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  codeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Code' },
  comment: String,
});

const Comment = mongoose.model('Comment', CommentSchema);

// Authentication Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  jwt.verify(token, 'secret', (err, user) => {
    if (err) return res.status(401).send({ error: 'Unauthorized' });
    req.user = user;
    next();
  });
};

// User Registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  res.status(201).send({ message: 'User registered successfully' });
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, 'secret');
  res.send({ token });
});

// Submit Code
app.post('/submit', auth, async (req, res) => {
  const { language, code } = req.body;
  const output = await compileCode(language, code);
  const codeEntry = new Code({ userId: req.user.userId, language, code, output });
  await codeEntry.save();
  res.send(codeEntry);
});

// Add Comment
app.post('/comment', auth, async (req, res) => {
  const { codeId, comment } = req.body;
  const commentEntry = new Comment({ userId: req.user.userId, codeId, comment });
  await commentEntry.save();
  
  // Add comment reference to the code
  await Code.findByIdAndUpdate(codeId, { $push: { comments: commentEntry._id } });
  
  res.send(commentEntry);
});

// Get All Codes and Comments
app.get('/codes', async (req, res) => {
  const codes = await Code.find().populate('userId').populate({
    path: 'comments',
    populate: { path: 'userId' }
  });
  res.send(codes);
});

// WebSocket Setup for Real-time Updates
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// JDoodle API Integration
async function compileCode(language, code) {
  const clientId = '752b2365a62ed0415b24f67cd4681424';
  const clientSecret = '6c537f62e46f512de7cd3bae560627b528df5237a7f0a076011cf4c43bca0426';
  const url = 'https://api.jdoodle.com/v1/execute';

  let script;
  let languageId;
  switch (language) {
    case 'python':
      script = code;
      languageId = 'python3';
      break;
    case 'java':
      script = code;
      languageId = 'java';
      break;
    case 'javascript':
      script = code;
      languageId = 'nodejs';
      break;
    default:
      throw new Error('Unsupported language');
  }

  const payload = {
    clientId,
    clientSecret,
    script,
    language: languageId,
    versionIndex: '0'
  };

  try {
    const response = await axios.post(url, payload);
    return response.data.output;
  } catch (error) {
    console.error('Error compiling code:', error);
    throw new Error('Failed to compile code');
  }
}
