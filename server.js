const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// स्टैटिक फ़ाइलें सर्व करें
app.use(express.static(__dirname));

// रूट पेज सर्व करें
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.IO कनेक्शन
io.on('connection', (socket) => {
  console.log('एक उपयोगकर्ता कनेक्ट हुआ');

  socket.on('call-offer', (offer) => {
    socket.broadcast.emit('call-offer', offer);
  });

  socket.on('call-answer', (answer) => {
    socket.broadcast.emit('call-answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    socket.broadcast.emit('ice-candidate', candidate);
  });

  socket.on('call-end', () => {
    socket.broadcast.emit('call-end');
  });

  socket.on('disconnect', () => {
    console.log('उपयोगकर्ता डिस्कनेक्ट हुआ');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`सर्वर http://localhost:${PORT} पर चल रहा है`);
});
