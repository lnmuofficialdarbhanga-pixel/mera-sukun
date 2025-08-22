// ज़रूरी मॉड्यूल आयात करें
const express = require('express'); // वेब सर्वर बनाने के लिए Express फ्रेमवर्क
const app = express(); // Express ऐप का इंस्टेंस बनाएँ
const http = require('http').Server(app); // HTTP सर्वर बनाएँ, जिसे Socket.IO इस्तेमाल करेगा
const io = require('socket.io')(http, {
    // Socket.IO के लिए CORS (Cross-Origin Resource Sharing) कॉन्फ़िगर करें
    // यह Render जैसे होस्टिंग प्लेटफ़ॉर्म पर ज़रूरी है
    // ताकि क्लाइंट ब्राउज़र सर्वर से कनेक्ट हो सकें।
    cors: {
        origin: "*", // किसी भी ओरिजिन (डोमेन) से कनेक्शन की अनुमति दें
        methods: ["GET", "POST"] // GET और POST HTTP विधियों की अनुमति दें
    }
});

// स्टैटिक फ़ाइलें सर्व करें
// यह 'public' फ़ोल्डर (या वर्तमान डायरेक्टरी) से HTML, CSS, JavaScript फ़ाइलें सर्व करेगा।
// सुनिश्चित करें कि आपकी index.html इसी डायरेक्टरी में है या 'public' नामक सब-फ़ोल्डर में।
app.use(express.static(__dirname));

// रूट URL ('/') के लिए HTTP GET रिक्वेस्ट हैंडल करें
// जब कोई उपयोगकर्ता आपकी वेबसाइट के मुख्य URL पर जाता है, तो यह index.html फ़ाइल भेजेगा।
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.IO कनेक्शन इवेंट हैंडल करें
// जब कोई क्लाइंट (उपयोगकर्ता का ब्राउज़र) Socket.IO सर्वर से कनेक्ट होता है
io.on('connection', (socket) => {
  console.log('एक उपयोगकर्ता कनेक्ट हुआ'); // सर्वर कंसोल में संदेश लॉग करें

  // 'call-offer' इवेंट हैंडल करें
  // जब कोई उपयोगकर्ता कॉल शुरू करने के लिए एक WebRTC ऑफ़र भेजता है
  socket.on('call-offer', (offer) => {
    // यह ऑफ़र सभी अन्य कनेक्टेड क्लाइंट्स को भेजें (जिसने भेजा उसे छोड़कर)
    socket.broadcast.emit('call-offer', offer);
    console.log('कॉल ऑफ़र भेजा गया');
  });

  // 'call-answer' इवेंट हैंडल करें
  // जब कोई उपयोगकर्ता एक WebRTC ऑफ़र का जवाब देता है
  socket.on('call-answer', (answer) => {
    // यह जवाब सभी अन्य कनेक्टेड क्लाइंट्स को भेजें
    socket.broadcast.emit('call-answer', answer);
    console.log('कॉल जवाब भेजा गया');
  });

  // 'ice-candidate' इवेंट हैंडल करें
  // जब WebRTC कनेक्शन के लिए ICE कैंडिडेट (नेटवर्क जानकारी) उपलब्ध होते हैं
  socket.on('ice-candidate', (candidate) => {
    // यह कैंडिडेट सभी अन्य कनेक्टेड क्लाइंट्स को भेजें
    socket.broadcast.emit('ice-candidate', candidate);
    console.log('ICE कैंडिडेट भेजा गया');
  });

  // 'call-end' इवेंट हैंडल करें
  // जब कोई उपयोगकर्ता कॉल समाप्त करता है
  socket.on('call-end', () => {
    // सभी अन्य कनेक्टेड क्लाइंट्स को सूचित करें कि कॉल समाप्त हो गई है
    socket.broadcast.emit('call-end');
    console.log('कॉल समाप्त हुई');
  });

  // 'disconnect' इवेंट हैंडल करें
  // जब कोई उपयोगकर्ता Socket.IO सर्वर से डिस्कनेक्ट होता है
  socket.on('disconnect', () => {
    console.log('उपयोगकर्ता डिस्कनेक्ट हुआ'); // सर्वर कंसोल में संदेश लॉग करें
  });
});

// सर्वर को एक पोर्ट पर सुनें
// Render और अन्य होस्टिंग प्लेटफ़ॉर्म 'process.env.PORT' का उपयोग करते हैं
// अगर यह उपलब्ध नहीं है, तो डिफ़ॉल्ट रूप से पोर्ट 3000 का उपयोग करें।
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`सर्वर http://localhost:${PORT} पर चल रहा है`);
  console.log(`आपकी वेबसाइट का नाम mera-sukun.onrender.com होगा (यदि आपने Render पर डिप्लॉय किया है)`);
});
