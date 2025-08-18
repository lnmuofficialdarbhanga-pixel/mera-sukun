const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`एक उपयोगकर्ता जुड़ गया है, आईडी: ${socket.id}`);

    socket.on('offer', (data) => {
        console.log('ऑफर प्राप्त हुआ, इसे प्रसारित कर रहे हैं...');
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', (data) => {
        console.log('उत्तर प्राप्त हुआ, इसे प्रसारित कर रहे हैं...');
        socket.broadcast.emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
        console.log('ICE उम्मीदवार प्राप्त हुआ, इसे प्रसारित कर रहे हैं...');
        socket.broadcast.emit('ice-candidate', data);
    });

    socket.on('disconnect', () => {
        console.log(`उपयोगकर्ता डिस्कनेक्ट हो गया है, आईडी: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`सर्वर http://localhost:${PORT} पर चल रहा है`);
});