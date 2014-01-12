var fs     = require('fs')
var crypto = require('crypto')
var http   = require('http')
var async  = require('async')
var mime   = require('mime')
var Stream = require('stream')
function noop() {}

var BCS = function (options) {
	options = options || {}
	this.accessKey = options.accessKey
	this.secretKey = options.secretKey
	this.hostname  = options.hostname || 'bcs.duapp.com'
	this.protocol  = options.protocol || 'http:'
	this.port      = options.port     || 3333
	this.ip        = options.ip // 允许上传的ip，默认为空，即：不限制ip
	this.time      = options.time // 有效时间
	this.size      = options.size // 限制上传最大字节
}

/*
* sign
*
* options: {
* 	method:'',
* 	bucket:'',
* 	object:''
* }
*/
BCS.prototype.generateSign = function (options) {
	/*
	* sign = Flag:AccessKey:Signature
	*/
	var self = this

	// content
	var flag = 'MBO'
	var content = 'Method=' + options['method'] + '\n'
							+ 'Bucket=' + options['bucket'] + '\n'
							+ 'Object=' + options['object'] + '\n'

	if (self.time) {
		flag += 'T'
		content += 'Time=' + self.time + '\n'
	}
	if (self.ip) {
		flag += 'I'
		content += 'Ip=' + self.ip + '\n'
	}
	if (self.size) {
		flag += 'S'
		content += 'Size=' + self.size + '\n'
	}
	content = flag + '\n' + content

	var signature = generateSignature(self.secretKey, content)
	var sign = flag + ':' + self.accessKey + ':' + signature
	return sign
}

function generateSignature (secretKey, content) {
	return crypto.createHmac('sha1', secretKey).update(content).digest().toString('base64')
}

/*
* request
*
* options: {
* 	path: '',
* 	method: '',
* 	headers: '',
* 	source: ''    // string (file path), buffer, stream
* }
*/
BCS.prototype.request = function (options, callback) {
	options = options || {}
	var self = this
	options.hostname = self.hostname

	var response = {}

	var req = http.request(options, function (res) {
		response['status'] = res.statusCode
		response['headers'] = res.headers
		response['body'] = ''

		res.setEncoding('utf8')

		res.on('data', function (chunk) {
			response['body'] += chunk
		})
		res.on('end', function () {
			callback(null, response)
		})

		if (options['headers']) {
			for (var header in options['headers']) {
				req.setHeader(header, options['headers'])
			}
		}

		req.on('error', function (error) {
			callback(error, null)
		})

		/*
		* body
		*/
		if (options.source) {
			if (typeof options.source === 'string') {
				dealSourceWithFilePath(options.source)
			} else if (Buffer.isBuffer(options.source)) {
				dealSourceWithBuffer(options.source)
			} else if (options.source instanceof Stream) {
				dealSourceWithStream(options.source)
			} else {
				req.end()
			}
		} else {
			req.end()
		}

		function dealSourceWithFilePath(filepath) {
			var contentType = mime.lookup(options.source)
			var contentLength = 0
			async.series([
				function (cb) {
					fs.stat(filepath, function (error, stats) {
						if (error) {
							return cb(error)
						}
						contentLength = stats.size
						cb(null)
					})
				}
			], function (error) {
				if (contentType) req.setHeader('Content-Type', contentType)
				if (contentLength) req.setHeader('Content-Length', contentLength)
				fs.createReadStream(filepath).pipe(req)
			})
		}
		function dealSourceWithBuffer(bufferSource) {
			var contentLength = bufferSource.length
			if (contentLength) req.setHeader('Content-Length', contentLength)
			req.end(bufferSource)
		}
		function dealSourceWithStream(streamSource) {
			fs.createReadStream(streamSource).pipe(req)
		}
	})
}



/*
* put bucket
*
* options: {
* 	bucket: '',
* 	acl: '' // optional
* }
*/
BCS.prototype.putBucket = function (options, callback) {
	options  = options || {}
	callback = callback || noop
	var self = this

	// headers
	var headers = {
		'Content-Length': 0
	}
	if (options.acl) {
		headers['x-bs-acl'] = options.acl
	}

	// path
	var path = '/' + options.bucket + '?sign=' + self.generateSign({
		method: 'PUT',
		bucket: options.bucket,
		object: '/'
	})

	self.request({
		path: path,
		method: 'PUT',
		headers: headers
	}, function (error, response) {
		callback(error, response)
	})
}

/*
* list Bucket
*/
BCS.prototype.listBucket = function (callback) {
	callback = callback || noop
	var self = this

	// headers
	var headers = {
		'Content-Length': 0
	}

	// path
	var path = '/?sign=' + self.generateSign({
		method: 'GET',
		bucket: '',
		object: '/'
	})

	self.request({
		path: path,
		method: 'GET',
		headers: headers
	}, function (error, response) {
		callback(error, response)
	})
}

/*
* delete Bucket
*/
BCS.prototype.deleteBucket = function (options, callback) {

}

/*
* put object
*
* options: {
* 	bucket: ''
* 	source: '',
* 	contentType   // optional
* }
*/
BCS.prototype.putObject = function (options, callback) {

}

/*
* copy object
*/
BCS.prototype.copyObject = function (options, callback) {

}

/*
* put superfile
*/
BCS.prototype.putSuperfile = function (options, callback) {

}

/*
* get object
*/
BCS.prototype.getObject = function (options, callback) {

}

/*
* head object
*/
BCS.prototype.headObject = function (options, callback) {

}

/*
* list object
*/
BCS.prototype.listObject = function (options, callback) {

}

/*
* delete object
*/
BCS.prototype.deleteObject = function (options, callback) {

}

/*
* put acl
*/
BCS.prototype.putAcl = function (options, callback) {

}

/*
* get acl
*/
BCS.prototype.getAcl = function (options, callback) {

}

/*
* export
*/
exports.createClient = function (options) {
	return new BCS(options)
}
