"use strict";

/* dependencies */
var aws          = require('aws-sdk'),
    express      = require('express'),
    morgan       = require('morgan'),
    multer       = require('multer');

/* environment variables */
var port         = process.env.PORT || 8080,
    accessKeyID  = process.env.AccessKeyID,
    secretKey    = process.env.SecretKey,
    region       = process.env.Region,
    s3Bucket     = process.env.S3Bucket,
    sqsQueue     = process.env.SQSQueue;

/* AWS setup */
aws.config.update({
  accessKeyId: accessKeyID,
  secretAccessKey: secretKey,
  region: region,
  logger: process.stdout
});

var s3               = new aws.S3();

var upload = multer({
  dest: __dirname + '/uploads'
});

var app = express();
app.use(morgan('combined')); // register morgan library for logging
app.use(express.static(__dirname + '/public', {'index': ['index.html']}));
app.post('/upload', upload.single('image'), function (req, res) {
  res.redirect('/');
});

app.get('/version', function (req, res) {
  res.end('0.0.2');
});

app.listen(port);

console.log('Server listens on port: ' + port);