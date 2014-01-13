var uid    = require('node-uuid')
var should = require('should')

var BCS = require('../index')
var bcs = BCS.createClient({
	accessKey: '',
	secretKey: ''
})

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
		done()
	})

	it('put object with buffer', function (done) {
		done()
	})

	it('put object with stream', function (done) {
		done()
	})

	it('put object with stream and contentType', function (done) {
		done()
	})

	it('copy object', function (done) {
		done()
	})

	it('head object', function (done) {
		done()
	})

	it('list object', function (done) {
		done()
	})

	it('get object', function (done) {
		done()
	})

	it('delete object', function (done) {
		done()
	})

	it('delete copied object', function (done) {
		done()
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
