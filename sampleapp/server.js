'use strict';

const express = require('express');
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "mariadb.mariadb.svc.cluster.local",
  user: "root",
  password: "DCtGLNjYzQ"
});

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    res.send('Hello World');
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
