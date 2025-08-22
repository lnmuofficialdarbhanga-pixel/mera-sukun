// आवश्यक मॉड्यूल आयात करें
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Express app और http सर्वर शुरू करें
const app = express();
const server = http.createServer(app);

// Socket.IO सर्वर शुरू करें
const io = new Server(server);

// अपने HTML फ़ाइल को सर्व करें
// यह सुनिश्चित करेगा कि जब भी कोई यूजर आपकी वेबसाइट खोलेगा, तो index.html पेज दिखेगा।
app.use(express.static(path.join(__dirname, '')));

// Socket.IO कनेक्शन को हैंडल करें
io.on('connection', (socket) => {
  console.log('एक नया यूजर कनेक्ट हुआ है:', socket.id);

  // 'offer' सिग्नल को हैंडल करें और इसे दूसरे यूजर को भेजें
  socket.on('offer', (offer) => {
    console.log('एक ऑफर प्राप्त हुआ');
    // ऑफर को भेजने वाले को छोड़कर बाकी सभी को भेजें
    socket.broadcast.emit('offer', offer);
  });

  // 'answer' सिग्नल को हैंडल करें
  socket.on('answer', (answer) => {
    console.log('एक उत्तर प्राप्त हुआ');
    // उत्तर को भेजने वाले को छोड़कर बाकी सभी को भेजें
    socket.broadcast.emit('answer', answer);
  });

  // 'ice-candidate' सिग्नल को हैंडल करें
  socket.on('ice-candidate', (candidate) => {
    console.log('एक ICE कैंडिडेट प्राप्त हुआ');
    // कैंडिडेट को भेजने वाले को छोड़कर बाकी सभी को भेजें
    socket.broadcast.emit('ice-candidate', candidate);
  });

  // 'call-ended' सिग्नल को हैंडल करें
  socket.on('call-ended', () => {
    console.log('एक कॉल समाप्त हो गई है');
    // कॉल समाप्त होने की सूचना सभी को दें
    socket.broadcast.emit('call-ended');
  });

  // जब कोई यूजर डिस्कनेक्ट होता है
  socket.on('disconnect', () => {
    console.log('यूजर डिस्कनेक्ट हुआ है:', socket.id);
  });
});

// सर्वर को लोकलहोस्ट पर पोर्ट 3000 पर चालू करें
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`सर्वर http://localhost:${PORT} पर चल रहा है`);
});
