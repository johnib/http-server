"use strict";

/* dependencies */
var aws = require('aws-sdk'),
    express = require('express'),
    morgan = require('morgan');

/* environment variables */
var port = process.env.PORT || 8080,
    accessKeyID = process.env.AccessKeyID,
    secretKey = process.env.SecretKey,
    region = process.env.Region || 'us-east-1',
    s3Bucket = process.env.S3Bucket || 'image-viewer-app';

/* AWS setup */
aws.config.update({
  accessKeyId: accessKeyID,
  secretAccessKey: secretKey,
  region: region,
  logger: process.stdout
});

var s3 = new aws.S3(),
    s3ImageKeyPrefix = 'images/',
    s3ThumbKeyPrefix = 'thumbs/',
    s3Url = 'https://s3.amazonaws.com/' + s3Bucket + '/',
    s3SignedUrlTTL = 120; // seconds

var app = express();
app.use(morgan('combined')); // register morgan library for logging
app.use(express.static(__dirname + '/public'));

app.get('/photos', function (req, res) {
  s3.listObjects({
    Bucket: s3Bucket,
    Prefix: s3ThumbKeyPrefix
  }, function (err, data) {
    var filtered = data.Contents.filter(function (item) {
      return item.Key.match(new RegExp("^" + s3ThumbKeyPrefix + ".+"));
    });

    var mapped = filtered.map(function (item) {
      var key = item.Key.replace(/\s/g, "+");
      return {url: s3Url + key};
    });

    res.json(mapped);
  })
});

app.get('/version', function (req, res) {
  res.end('0.1.0');
});

app.get('/sign-url', function (req, res) {
  var options = {
    Bucket: s3Bucket,
    Key: s3ImageKeyPrefix + req.query.fileName,
    Expires: s3SignedUrlTTL,
    ContentType: req.query.fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', options, function (err, data) {
    if (err) {
      console.error(err);
      res.json(err);

    } else {
      res.json({
        signed_url: data,
        url: s3Url + s3ImageKeyPrefix + req.query.fileName
      });
    }
  })
});

app.listen(port);

console.log('Server listens on port: ' + port);