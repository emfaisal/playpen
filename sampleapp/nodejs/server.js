'use strict';

const express = require('express');
const mysql = require('mysql');

const app = express();

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
  app.get('/', (req, res) => {
    res.json({
      message: 'hello world'
    });
  });

  // Start the server
  app.listen(8080, () => {
    console.log('Server started on port 3000');
  });
});
