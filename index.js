const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { exec } = require('child_process');
const fs = require('fs');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/online-compiler', {
    useNewUrlParser: true,
    useUnifiedTopology: true
 
});

let code = '// Type your code here';
let comments = [];

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

io.on('connection', (socket) => {
    socket.emit('codeUpdate', code);
    socket.emit('updateComments', comments);

    socket.on('codeChange', (newCode) => {
        code = newCode;
        socket.broadcast.emit('codeUpdate', newCode);
    });

    socket.on('newComment', (comment) => {
        comments.push(comment);
        io.emit('updateComments', comments);
    });
});

app.post('/execute', (req, res) => {
    const { code, language } = req.body;
    let command;

    switch (language) {
        case 'python':
            fs.writeFileSync('temp.py', code);
            command = `python temp.py`;
            break;
        case 'java':
            fs.writeFileSync('Main.java', code);
            command = `javac Main.java && java Main`;
            break;
        default:
            return res.json({ error: 'Unsupported language' });
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.json({ error: stderr });
        } else {
            res.json({ output: stdout });
        }
    });
});

app.get('/', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        res.sendFile(__dirname + '/public/index.html');
    } else {
        res.sendFile(__dirname + '/public/guest.html');
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
