"use strict";

/* dependencies */
var aws          = require('aws-sdk'),
    express      = require('express'),
    morgan = require('morgan');

/* environment variables */
var port = process.env.PORT || 8080,
    accessKeyID  = process.env.AccessKeyID,
    secretKey    = process.env.SecretKey,
    region = process.env.Region || 'us-east-1',
    s3Bucket = process.env.S3Bucket || 'image-viewer-app',
    sqsQueue = process.env.SQSQueue || 'https://sqs.us-east-1.amazonaws.com/314570958983/image-viewer-app-queue';

/* AWS setup */
aws.config.update({
  accessKeyId: accessKeyID,
  secretAccessKey: secretKey,
  region: region,
  logger: process.stdout
});

var s3 = new aws.S3(),
    s3KeyPrefix = 'images/',
    s3SignedUrlTTL = 120; // seconds

var app = express();
app.use(morgan('combined')); // register morgan library for logging
app.use(express.static(__dirname + '/public', {'index': ['index.html']}));

app.get('/version', function (req, res) {
  res.end('0.1.0');
});

app.get('/sign-url', function (req, res) {
  var options = {
    Bucket: s3Bucket,
    Key: s3KeyPrefix + req.query.fileName,
    Expires: s3SignedUrlTTL,
    ContentType: req.query.fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', options, function (err, data) {
    if (err) {
      console.error(err);
      res.end('error');
      return;
    }

    res.json({
      signed_url: data,
      url: 'https://s3.amazonaws.com/' + s3Bucket + '/' + s3KeyPrefix + req.query.fileName
    });
  })
});

app.listen(port);

console.log('Server listens on port: ' + port);