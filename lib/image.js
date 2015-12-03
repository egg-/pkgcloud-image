/**
 * images.js: image handler
 *
 * (C) 2015, MADSquare Inc.
 * @version 0.0.1
 * @author MADSquare Inc.
 */

var pkgcloud = require('pkgcloud')
var gm = require('gm')
var async = require('async')
var shortid = require('shortid')

/**
 * @class Image
 * @description 이미지 파일을 pkgcloud를 이용하여 remote storage에 저장 및 삭제.
 * @param {Image~CONFIG} config pkgcloud client configuration.
 * @see https://github.com/pkgcloud/pkgcloud
 */
function Image (config) {
  this.config = config
  this.client = pkgcloud.storage.createClient(config)
}

/**
 * 지정된 파일을 resize, crop 하여 업로드
 * @method uploads
 * @memberof Image.prototype
 * @param {object} opts
 * @param {object} opts.file `{ path: '', extension: '', mimetype: ''}`
 * @param {array} opts.thumbs `[{ size: [100, 100, '^'], base: 'remote base dir', prefix: prefix name }]`
 * @param {Function} cb
 * @return {array} 업로드된 URL 목록.
 * @see https://github.com/aheckmann/gm
 * @example
 * image.upload(cb, {
 * file: file,
 * thumbs: [
	{
		size: [100, 100, '^'],
		base: base,
		prefix: '/' + us_no
	},
	{
		size: [50, 50, '^'],
		base: base,
		prefix: '/50x50/' + us_no
	}
]
})
 */
Image.prototype.uploads = function (opts, cb) {
  var self = this
  var tasks = []
  var seed = shortid.generate()

  for (var i = 0; i < opts.thumbs.length; i++) {
    tasks.push(function (thumb) {
      return function (cb) {
        var writeStream = self.client.upload({
          container: self.config.container,
          remote: thumb.base + thumb.prefix + '_' + seed + '.' + opts.file.extension,
          contentType: opts.file.mimetype,
          acl: 'public-read'
        })

        writeStream.on('success', function (result) {
          cb(null, self.config.cdn + result.name)
        })

        gm(opts.file.path)
          .resize(thumb.size[0], thumb.size[1], thumb.size[2] || '^')
          .gravity('Center')
          .crop(thumb.size[0], thumb.size[1], 0, 0)
          .stream()
          .pipe(writeStream)
          .on('error', function (err) {
            cb(err)
          })
      }
    }(opts.thumbs[i]))
  }

  async.parallel(tasks, cb)
}

/**
 * 지정된 파일을 remote storage에서 삭제.
 * @method delete
 * @memberof Image.prototype
 * @param {Function} cb
 * @param {array} files
 * @example
 * client.image.delete(cb, [
	'picture' + base + file,
	'picture' + base + '50x50/' + file
])
 */
Image.prototype.delete = function (files, cb) {
  var self = this
  var tasks = []

  for (var i = 0; i < files.length; i++) {
    tasks.push(function (file) {
      return function (cb) {
        self.client.removeFile(self.config.container, file, cb)
      }
    }(files[i]))
  }

  async.parallel(tasks, cb)
}

/**
 * @typedef {object} Image~CONFIG
 * @property {string} provider
 * @property {string} key
 * @property {string} keyId
 * @property {string} region
 * @property {string} container
 * @property {string} cdn
 * @example
 * {
	provider: 'amazon',
	key: 'secretAccessKey'
	keyId: 'accessKey',
	region: 'region',
	container: 'bucket',
	cdn: 'http://config.cdn/'
 *}
 */

module.exports = Image
