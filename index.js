const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');  // Don't forget to require jwt
const { exec } = require('child_process');
const fs = require('fs');
const authRoutes = require('./public/server');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/online-compiler', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

let code = '// Type your code here';
let comments = [];

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

// Serve login and signup pages
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

// Middleware to check authentication
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    try {
        req.user = jwt.verify(token, 'your_jwt_secret');
        next();
    } catch (err) {
        res.redirect('/login');
    }
});

// Serve main application if authenticated
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/compiler.html');
});