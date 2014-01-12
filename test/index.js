var BCS = require('../index')
var bcs = BCS.createClient({
	accessKey: '',
	secretKey: ''
})

describe('bucket', function () {
	it('list bucket', function (done) {
		bcs.listBucket(function (error, result) {
			console.log(result)
			done()
		})
	})
})

describe('object', function () {
	it('create object', function (done) {
		done()
	})
})

describe('acl', function () {
	it('', function (done) {
		done()
	})
})