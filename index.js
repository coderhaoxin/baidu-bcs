'use strict';

var mime = require('mime-types'),
  assert = require('assert'),
  crypto = require('crypto'),
  Stream = require('stream'),
  http = require('http'),
  fs = require('fs');

function noop() {}

var BCS = function(options) {
  this.accessKey = options.accessKey;
  this.secretKey = options.secretKey;
  this.host = options.host || 'bcs.duapp.com';
  this.protocol = options.protocol || 'http:';
  this.port = options.port || 80;
  this.timeout = options.timeout || 300000; // 5 minutes
  this.ip = options.ip; // 允许上传的ip，默认为空，即：不限制ip
  this.time = options.time; // 有效时间
  this.size = options.size; // 限制上传最大字节

  if (options.hasOwnProperty('agent')) {
    this.agent = options.agent;
  } else {
    var agent = new http.Agent();
    agent.maxSockets = 20;
    this.agent = agent;
  }
};

/*
 * sign
 *
 * options: {
 *   method:'',
 *   bucket:'',
 *   object:''
 * }
 */
BCS.prototype.generateSign = function(options) {
  /*
   * sign = Flag:AccessKey:Signature
   */
  var flag = 'MBO',
    content = 'Method=' + options.method + '\n' + 'Bucket=' + options.bucket + '\n' + 'Object=' + options.object + '\n';

  if (this.time) {
    flag += 'T';
    content += 'Time=' + this.time + '\n';
  }
  if (this.ip) {
    flag += 'I';
    content += 'Ip=' + this.ip + '\n';
  }
  if (this.size) {
    flag += 'S';
    content += 'Size=' + this.size + '\n';
  }
  content = flag + '\n' + content;

  var signature = crypto.createHmac('sha1', this.secretKey).update(content).digest().toString('base64');
  var sign = flag + ':' + this.accessKey + ':' + encodeURIComponent(signature);

  return sign;
};

/*
 * request
 *
 * options: {
 *   path: '',
 *   method: '',
 *   headers: '',
 *   source: ''    // string (file path), buffer, stream
 * }
 */
BCS.prototype.request = function(options, callback) {
  options.host = this.host;
  options.port = this.port;
  options.timeout = this.timeout;
  options.agent = this.agent;

  if (options.path) {
    options.path.split('/').map(function(item) {
      return encodeURIComponent(item);
    }).join('/');
  }

  var req = http.request(options, function(res) {
    var response = {},
      wstream;

    response.status = res.statusCode;
    response.headers = res.headers;
    response.body = '';

    if (options.dest) {
      wstream = (typeof options.dest === 'string') ? fs.createWriteStream(options.dest) : options.dest;
      res.pipe(wstream);
      wstream.on('finish', function() {
        response.body = 'write to stream success';
        callback(null, response);
      });
      wstream.on('error', function(error) {
        callback(error, null);
      });
    } else {
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        response.body += chunk;
      });
    }

    res.on('end', function() {
      if (options.dest) {
        return;
      }
      if ((res.headers['content-type'] === 'application/json') && response.body) {
        try {
          response.body = JSON.parse(response.body);
        } catch (e) {}
      }

      if (response.status >= 400) {
        var error = new Error(),
          errorMessage = response.body && response.body.Error;
        if (errorMessage) {
          error.code = errorMessage.code;
          error.status = response.status;
          error.message = errorMessage.Message;
          error.requestId = errorMessage.RequestId;
        }
        callback(error, null);
      } else {
        callback(null, response);
      }
    });
  });

  req.on('error', function(error) {
    callback(error, null);
  });

  /*
   * body
   */
  if (options.source) {
    if (typeof options.source === 'string') {
      dealSourceWithFilePath(options.source);
    } else if (Buffer.isBuffer(options.source)) {
      dealSourceWithBuffer(options.source);
    } else if (options.source instanceof Stream) {
      options.source.pipe(req);
    } else {
      req.end();
    }
  } else {
    req.end();
  }

  function dealSourceWithFilePath(filepath) {
    var contentType = mime.lookup(options.source);

    fs.stat(filepath, function(error, stats) {
      if (error) {
        return callback(error);
      }
      if (contentType && !req.getHeader('Content-Type')) {
        req.setHeader('Content-Type', contentType);
      }
      var contentLength = stats.size;
      if (contentLength) {
        req.setHeader('Content-Length', contentLength);
      }
      fs.createReadStream(filepath).pipe(req);
    });
  }

  function dealSourceWithBuffer(bufferSource) {
    var contentLength = bufferSource.length;
    if (contentLength) {
      req.setHeader('Content-Length', contentLength);
    }
    req.end(bufferSource);
  }
};



/*
 * put bucket
 *
 * options: {
 *   bucket: '',
 *   acl: '' // optional
 * }
 */
BCS.prototype.putBucket = function(options, callback) {
  options = options || {};
  callback = callback || noop;

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;

  if (options.acl) {
    headers['x-bs-acl'] = options.acl;
  }

  // path
  var path = '/' + options.bucket + '?sign=' + this.generateSign({
    method: 'PUT',
    bucket: options.bucket,
    object: '/'
  });

  this.request({
    path: path,
    method: 'PUT',
    headers: headers
  }, function(error, response) {
    callback(error, response);
  });
};

/*
 * list Bucket
 */
BCS.prototype.listBucket = function(callback) {
  callback = callback || noop;

  // headers
  var headers = {
    'Content-Length': 0
  };

  // path
  var path = '/?sign=' + this.generateSign({
    method: 'GET',
    bucket: '',
    object: '/'
  });

  this.request({
    path: path,
    method: 'GET',
    headers: headers
  }, function(error, response) {
    callback(error, response);
  });
};

/*
 * delete Bucket
 */
BCS.prototype.deleteBucket = function(options, callback) {
  options = options || {};
  callback = callback || noop;

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;

  if (options.acl) {
    headers['x-bs-acl'] = options.acl;
  }

  // path
  var path = '/' + options.bucket + '?sign=' + this.generateSign({
    method: 'DELETE',
    bucket: options.bucket,
    object: '/'
  });

  this.request({
    path: path,
    method: 'DELETE',
    headers: headers
  }, function(error, response) {
    callback(error, response);
  });
};

/*
 * put object
 *
 * options: {
 *   bucket: '',
 *   object: '',
 *   source: '',
 *   headers: {} // optional
 * }
 */
BCS.prototype.putObject = function(options, callback) {
  options = options || {};
  callback = callback || noop();

  // headers
  var headers = options.headers || {};

  // path
  var path = '/' + options.bucket + '/' + options.object + '?sign=' + this.generateSign({
    method: 'PUT',
    bucket: options.bucket,
    object: '/' + options.object
  });

  this.request({
    path: path,
    method: 'PUT',
    headers: headers,
    source: options.source
  }, function(error, response) {
    callback(error, response);
  });
};

/*
* copy object
*
* option: {
*   sourceBucket: '',
*   sourceObject: '',
*   bucket: '',
*   object: ''
}
*/
BCS.prototype.copyObject = function(options, callback) {
  options = options || {};
  callback = callback || noop();

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;
  headers['x-bs-copy-source'] = 'http://bcs.duapp.com/' + options.sourceBucket + '/' + options.sourceObject;

  // path
  var path = '/' + options.bucket + '/' + options.object + '?sign=' + this.generateSign({
    method: 'PUT',
    bucket: options.bucket,
    object: '/' + options.object
  });

  this.request({
    path: path,
    method: 'PUT',
    headers: headers,
    source: options.source
  }, function(error, response) {
    callback(error, response);
  });
};

/*
 * put superfile
 */
BCS.prototype.putSuperfile = function(options, callback) {
  // todo: ......
  callback(null, options);
};

/*
 * get object
 */
BCS.prototype.getObject = function(options, callback) {
  options = options || {};
  callback = callback || noop();

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;

  // path
  var path = '/' + options.bucket + '/' + options.object + '?sign=' + this.generateSign({
    method: 'GET',
    bucket: options.bucket,
    object: '/' + options.object
  });

  this.request({
    path: path,
    method: 'GET',
    headers: headers,
    dest: options.dest
  }, function(error, response) {
    callback(error, response);
  });
};

/*
 * head object
 */
BCS.prototype.headObject = function(options, callback) {
  options = options || {};
  callback = callback || noop;

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;

  // path
  var path = '/' + options.bucket + '/' + options.object + '?sign=' + this.generateSign({
    method: 'HEAD',
    bucket: options.bucket,
    object: '/' + options.object
  });

  this.request({
    path: path,
    method: 'HEAD',
    headers: headers
  }, function(error, response) {
    callback(error, response);
  });
};

/*
* list object
*
* options: {
*   bucket: ''
*   start: 0,    // optional, default: 0
*   limit: 30    // optional, default: 1000
}
*/
BCS.prototype.listObject = function(options, callback) {
  options = options || {};
  options.start = options.start || 0;
  options.limit = options.limit || 1000;
  callback = callback || noop;

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;

  // path
  var path = '/' + options.bucket + '?sign=' + this.generateSign({
    method: 'GET',
    bucket: options.bucket,
    object: '/'
  }) + '&start=' + options.start + '&limit=' + options.limit;

  this.request({
    path: path,
    method: 'GET',
    headers: headers
  }, function(error, response) {
    callback(error, response);
  });
};

/*
 * delete object
 */
BCS.prototype.deleteObject = function(options, callback) {
  options = options || {};
  callback = callback || noop;

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;

  // path
  var path = '/' + options.bucket + '/' + options.object + '?sign=' + this.generateSign({
    method: 'DELETE',
    bucket: options.bucket,
    object: '/' + options.object
  });

  this.request({
    path: path,
    method: 'DELETE',
    headers: headers
  }, function(error, response) {
    callback(error, response);
  });
};

/*
 * put acl
 */
BCS.prototype.putAcl = function(options, callback) {
  options = options || {};
  callback = callback || noop;

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;
  headers['x-bs-acl'] = options.acl;


  // path
  var path = '/' + options.bucket + '?acl=1&sign=' + this.generateSign({
    method: 'PUT',
    bucket: options.bucket,
    object: '/'
  });

  this.request({
    path: path,
    method: 'PUT',
    headers: headers
  }, function(error, response) {
    callback(error, response);
  });
};

/*
 * get acl
 */
BCS.prototype.getAcl = function(options, callback) {
  options = options || {};
  callback = callback || noop;

  // headers
  var headers = options.headers || {};
  headers['Content-Length'] = 0;

  // path
  var path = '/' + options.bucket + '?acl=1&sign=' + this.generateSign({
    method: 'GET',
    bucket: options.bucket,
    object: '/'
  });

  this.request({
    path: path,
    method: 'GET',
    headers: headers
  }, function(error, response) {
    callback(error, response);
  });
};

/**
 * exports
 */
exports.createClient = function(options) {
  assert(typeof options === 'object', 'invalid options');

  var client = new BCS(options);

  var wrapper = options.wrapper;
  if (wrapper) {
    require('thunkify-or-promisify')(client, wrapper, ['request', 'generateSign']);
  }

  return client;
};
