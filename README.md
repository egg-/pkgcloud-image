# pkgcloud-image

[![version](https://img.shields.io/npm/v/pkgcloud-image.svg) ![download](https://img.shields.io/npm/dm/pkgcloud-image.svg)](https://www.npmjs.com/package/pkgcloud-image)

Image resize and upload by pkgcloud.


## Dependencies

* [gm](https://www.npmjs.com/package/gm)


## Usage

```javascript
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

```

```json
// config.json
{
    "profile": "s3.profile name",
    "s3": {
        "bucket": "bucketname",
        "region": "ap-northeast-1",
        "cdn": "https://cdnsubdomain.cloudfront.net/"
    }
}

```


## Release History

See the [changelog](CHANGELOG.md)


## LICENSE

pkgcloud-image is licensed under the MIT license.
