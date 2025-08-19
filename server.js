// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Maps
// email -> socketId
let usersByEmail = {};
// socketId -> email
let emailBySocket = {};

io.on('connection', (socket) => {
    console.log(`एक उपयोगकर्ता जुड़ा: ${socket.id}`);

    // Register with email (frontend sends this after successful Firebase login)
    socket.on('register', (email) => {
        usersByEmail[email] = socket.id;
        emailBySocket[socket.id] = email;
        console.log(`Registered ${email} => ${socket.id}`);
    });

    // Unregister (on logout)
    socket.on('unregister', (email) => {
        if (usersByEmail[email] === socket.id) {
            delete usersByEmail[email];
        }
        delete emailBySocket[socket.id];
        console.log(`Unregistered ${email}`);
    });

    // Offer: caller -> targetEmail
    socket.on('offer', ({ offer, targetEmail }) => {
        const targetId = usersByEmail[targetEmail];
        if (targetId) {
            io.to(targetId).emit('offer', { offer, from: socket.id, fromEmail: emailBySocket[socket.id] || null });
            console.log(`Offer from ${socket.id} -> ${targetId} (${targetEmail})`);
        } else {
            // target offline / not registered
            io.to(socket.id).emit('user-unavailable', { message: 'Target user not available' });
            console.log(`Target ${targetEmail} not available for offer`);
        }
    });

    // Answer: callee -> targetId (which is caller's socket id)
    socket.on('answer', ({ answer, targetId }) => {
        io.to(targetId).emit('answer', { answer, from: socket.id, fromEmail: emailBySocket[socket.id] || null });
        console.log(`Answer from ${socket.id} -> ${targetId}`);
    });

    // ICE candidate: accept either targetId (socketId) or targetEmail
    socket.on('ice-candidate', ({ candidate, targetId, targetEmail }) => {
        let dest = targetId;
        if (!dest && targetEmail) dest = usersByEmail[targetEmail];
        if (dest) {
            io.to(dest).emit('ice-candidate', { candidate, from: socket.id });
            //console.log(`ICE from ${socket.id} -> ${dest}`);
        } else {
            // ignore or notify
            console.log('ICE target not found');
        }
    });

    // call-ended: notify the other side if possible (targetId or targetEmail)
    socket.on('call-ended', ({ targetId, targetEmail } = {}) => {
        let dest = targetId || (targetEmail && usersByEmail[targetEmail]);
        if (dest) io.to(dest).emit('call-ended');
    });

    socket.on('disconnect', () => {
        const email = emailBySocket[socket.id];
        if (email) {
            delete usersByEmail[email];
            delete emailBySocket[socket.id];
            console.log(`डिस्कनेक्ट और रिमूव हुआ: ${email} (${socket.id})`);
        } else {
            console.log(`डिस्कनेक्ट: ${socket.id}`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`सर्वर http://localhost:${PORT} पर चल रहा है`);
});
