const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Ein Spieler verbunden!');

  // Hier kommt später der Multiplayer-Code hin
});

const PORT = 4000;
http.listen(PORT, () => {
  console.log(`Server läuft unter http://localhost:${PORT}`);
});
