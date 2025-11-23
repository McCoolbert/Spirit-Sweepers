const express = require('express');
const app = express();
const path = require('path');

// Statische Dateien aus "public" ausliefern:
app.use(express.static(path.join(__dirname, 'public')));

// Falls noch nicht vorhanden: Route für "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
