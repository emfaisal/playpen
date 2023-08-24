'use strict';

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

// Disable CORS
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MariaDB database
const connection = mysql.createConnection({
  host: 'mariadb.sampleapp.svc.cluster.local',
  user: 'root',
  password: '7hdMw3K0hE',
  database: 'mysql'
});

connection.connect((err) => {
  if (err) {
    console.log(err);
    process.exit();
  }

  // Create a route that responds with "hello world" in JSON format
  app.get('/api/v1/hello-world', (req, res) => {
    res.json({
      message: 'hello world - /api/v1/hello-world'
    });
  });

  // Start the server
  app.listen(8080, () => {
    console.log('Server started on port 8080');
  });
});
