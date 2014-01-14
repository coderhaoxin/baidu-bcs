var fs     = require('fs')
var uid    = require('node-uuid')
var should = require('should')

var config = require('./config')

var BCS = require('../index')
var bcs = BCS.createClient(config)

describe('bucket', function () {
	var bucketName01 = 'bucket' + uid.v4().split('-').join('')
	var bucketName02 = 'bucket' + uid.v4().split('-').join('')

	it('list bucket', function (done) {
		bcs.listBucket(function (error, result) {
			should.not.exist(error)
			result.body.length.should.above(-1)
			done()
		})
	})

	it('put bucket', function (done) {
		bcs.putBucket({
			bucket: bucketName01,
			acl: 'public-read'
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('put bucket with acl', function (done) {
		bcs.putBucket({
			bucket: bucketName02,
			acl: 'public-read'
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('delete bucket', function (done) {
		bcs.deleteBucket({
			bucket: bucketName01
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('delete bucket', function (done) {
		bcs.deleteBucket({
			bucket: bucketName02
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})
})

describe('object', function () {
	var bucketName = 'bucket' + uid.v4().split('-').join('')

	it('put bucket with acl', function (done) {
		bcs.putBucket({
			bucket: bucketName,
			acl: 'public-read'
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	var objectName01 = uid.v4().split('-').join('')
	var objectName02 = uid.v4().split('-').join('')
	var objectName03 = uid.v4().split('-').join('')
	var objectName04 = uid.v4().split('-').join('')
	var objectName05 = uid.v4().split('-').join('')

	it('put object with file path', function (done) {
		bcs.putObject({
			bucket: bucketName,
			object: objectName01,
			source: './index.js'
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('put object with buffer', function (done) {
		bcs.putObject({
			bucket: bucketName,
			object: objectName02,
			source: new Buffer('baidu-bcs'),
			headers: {
				'Content-Type': 'text/plain'
			}
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('put object with stream', function (done) {
		bcs.putObject({
			bucket: bucketName,
			object: objectName03,
			source: fs.createReadStream(__dirname + '/config.js'),
			headers: {
				'Content-Type': 'text/plain',
				'Content-Length': fs.statSync(__dirname + '/config.js').size
			}
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('put object with stream and headers', function (done) {
		bcs.putObject({
			bucket: bucketName,
			object: objectName04,
			source: fs.createReadStream(__dirname + '/config.js'),
			headers: {
				'Content-Type': 'text/plain',
				'Content-Length': fs.statSync(__dirname + '/config.js').size,
				'x-bs-meta-type': 'stream'
			}
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('copy object', function (done) {
		bcs.copyObject({
			bucket: bucketName,
			object: objectName05,
			sourceBucket: bucketName,
			sourceObject: objectName04,
			headers: {
				'Content-Type': 'text/plain'
			}
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('head object', function (done) {
		bcs.headObject({
			bucket: bucketName,
			object: objectName04
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			result.headers['x-bs-meta-type'].should.equal('stream')
			result.headers['content-type'].should.equal('text/plain')
			done()
		})
	})

	it('list object', function (done) {
		bcs.listObject({
			bucket: bucketName,
			start: 1,
			limit: 1
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			result.body.object_total.should.above(1)
			done()
		})
	})

	it('get object', function (done) {
		bcs.getObject({
			bucket: bucketName,
			object: objectName02,
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			result.body.should.equal('baidu-bcs')
			done()
		})
	})

	it('delete object', function (done) {
		var a      = [objectName01, objectName02, objectName03, objectName04, objectName05]
		var length = a.length
		var count  = 0
		a.forEach(function (eachObjectName) {
			bcs.deleteObject({
				bucket: bucketName,
				object: eachObjectName
			}, function (error, result) {
				should.not.exist(error)
				result.status.should.equal(200)
				count++
				if (count === length) {
					done()
				}
			})
		})
	})

	it('delete bucket', function (done) {
		bcs.deleteBucket({
			bucket: bucketName
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})
})

describe('acl', function () {
	var bucketName = 'bucket' + uid.v4().split('-').join('')

	it('put bucket with acl', function (done) {
		bcs.putBucket({
			bucket: bucketName,
			acl: 'public-read'
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('get bucket acl', function (done) {
		bcs.getAcl({
			bucket: bucketName
		}, function (error, result) {
			should.not.exist(error)
			result.body.statements.length.should.above(0)
			done()
		})
	})

	it('put bucket acl', function (done) {
		bcs.putAcl({
			bucket: bucketName,
			acl: 'private'
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})

	it('delete bucket', function (done) {
		bcs.deleteBucket({
			bucket: bucketName
		}, function (error, result) {
			should.not.exist(error)
			result.status.should.equal(200)
			done()
		})
	})
})
