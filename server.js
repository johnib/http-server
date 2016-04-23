"use strict";

var express = require('express'),
    morgan = require('morgan'),
    multer = require('multer');

var port = process.env.PORT || 8080;

var upload = multer({
  dest: __dirname + '/uploads'
});

var app = express();

app.use(morgan('combined'));
app.use(express.static(__dirname + '/public', {'index': ['index.html']}));
app.post('/upload', upload.single('image'), function (req, res) {
  res.redirect('/');
});

app.get('/version', function (req, res) {
  res.end('0.0.2');
});

app.listen(port);

console.log('Server listens on port: ' + port);