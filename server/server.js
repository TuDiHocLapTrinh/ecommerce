const express = require('express');
require('dotenv').config();
const dbconnect = require('./config/dbconnect');
const initRoutes = require('./routes');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 8088;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

dbconnect();
initRoutes(app);

app.use('/', (req, res) => {
  res.send('SERVER ONNNNN');
});

app.listen(port, () => {
  console.log('Server running on the port: ' + port);
});
