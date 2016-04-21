"use strict";

var express = require('express'),
    multer = require('multer');

var upload = multer({
  dest: __dirname + '/uploads'
});

var app = express();

app.use(express.static(__dirname + '/public', {'index': ['index.html']}));
app.post('/upload', upload.single('image'), function (req, res) {
  res.redirect('/');
});

app.listen(3000);

