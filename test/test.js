var AWS = require('aws-sdk')
var Image = require('../')
var config = require('./config.json')

var credentials = new AWS.SharedIniFileCredentials({ profile: config.profile })
var image = new Image({
  provider: 'amazon',
  key: credentials.secretAccessKey,
  keyId: credentials.accessKeyId,
  region: config.s3.region,
  container: config.s3.bucket,
  cdn: config.s3.cdn
})

var file = {
  path: 'img.jpg',
  extension: 'jpg',
  mimetype: 'image/jpg'
}

var thumbs = [
  {
    base: 'test',
    prefix: '100x100',
    size: [100, 100]
  }
]

image.uploads({
  file: file,
  thumbs: thumbs
}, function (err, result) {
  console.log(err, result)
  image.delete([
    result[0].replace(config.s3.cdn, '')
  ], function (err) {
    console.log(err)
  })
})
