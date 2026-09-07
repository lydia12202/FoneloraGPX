const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`GPX Converter 伺服器已啟動`);
  console.log(`開啟瀏覽器前往: http://localhost:${PORT}`);
});
