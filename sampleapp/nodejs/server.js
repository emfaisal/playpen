'use strict';

const express = require('express');
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "mariadb.sampleapp.svc.cluster.local",
  user: "root",
  password: "7hdMw3K0hE"
});

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
