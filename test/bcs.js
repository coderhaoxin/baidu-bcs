'use strict';

var config = require('./config'),
  uid = require('node-uuid'),
  should = require('should'),
  BCS = require('..'),
  fs = require('fs');

var bcs = BCS.createClient(config);

describe('bucket', function() {
  var bucketName01 = 'bucket' + uid.v4(),
    bucketName02 = 'bucket' + uid.v4();

  it('list bucket', function(done) {
    bcs.listBucket(function(error, result) {
      should.not.exist(error);
      result.body.length.should.above(-1);
      done();
    });
  });

  it('put bucket', function(done) {
    bcs.putBucket({
      bucket: bucketName01,
      acl: 'public-read'
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('put bucket with acl', function(done) {
    bcs.putBucket({
      bucket: bucketName02,
      acl: 'public-read'
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('list bucket', function(done) {
    bcs.listBucket(function(error, result) {
      should.not.exist(error);
      result.body.length.should.above(1);
      done();
    });
  });

  it('delete bucket', function(done) {
    bcs.deleteBucket({
      bucket: bucketName01
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('delete bucket', function(done) {
    bcs.deleteBucket({
      bucket: bucketName02
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });
});

describe('object', function() {
  var bucketName = 'bucket' + uid.v4();

  it('put bucket with acl', function(done) {
    bcs.putBucket({
      bucket: bucketName,
      acl: 'public-read'
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  var objectName01 = uid.v4(),
    objectName02 = uid.v4(),
    objectName03 = uid.v4(),
    objectName04 = uid.v4(),
    objectName05 = uid.v4();

  it('put object with file path', function(done) {
    bcs.putObject({
      bucket: bucketName,
      object: objectName01,
      source: __filename
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('put object with buffer', function(done) {
    bcs.putObject({
      bucket: bucketName,
      object: objectName02,
      source: new Buffer('baidu-bcs'),
      headers: {
        'Content-Type': 'text/plain'
      }
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('put object with stream', function(done) {
    bcs.putObject({
      bucket: bucketName,
      object: objectName03,
      source: fs.createReadStream(__dirname + '/config.js'),
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': fs.statSync(__dirname + '/config.js').size
      }
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('put object with stream and headers', function(done) {
    bcs.putObject({
      bucket: bucketName,
      object: objectName04,
      source: fs.createReadStream(__dirname + '/config.js'),
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': fs.statSync(__dirname + '/config.js').size,
        'x-bs-meta-type': 'stream'
      }
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('copy object', function(done) {
    bcs.copyObject({
      bucket: bucketName,
      object: objectName05,
      sourceBucket: bucketName,
      sourceObject: objectName04,
      headers: {
        'Content-Type': 'text/plain'
      }
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('head object', function(done) {
    bcs.headObject({
      bucket: bucketName,
      object: objectName04
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      result.headers['x-bs-meta-type'].should.equal('stream');
      result.headers['content-type'].should.equal('text/plain');
      done();
    });
  });

  it('list object', function(done) {
    bcs.listObject({
      bucket: bucketName
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      result.body.object_total.should.above(1);
      done();
    });
  });

  it('list object', function(done) {
    bcs.listObject({
      bucket: bucketName,
      start: 1,
      limit: 1
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      result.body.object_total.should.above(1);
      done();
    });
  });

  it('get object no dest', function(done) {
    bcs.getObject({
      bucket: bucketName,
      object: objectName02,
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      result.body.toString().should.equal('baidu-bcs');
      done();
    });
  });

  it('get object with dest(file path)', function(done) {
    var path = __dirname + '/xxoo.download';
    bcs.getObject({
      bucket: bucketName,
      object: objectName01,
      dest: path
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      result.body.should.equal('write to stream success');
      fs.statSync(path).size.should.equal(fs.statSync(__filename).size);
      fs.readFileSync(path, 'utf8').should.equal(fs.readFileSync(__filename, 'utf8'));
      fs.unlinkSync(path);
      done();
    });
  });

  it('get object with dest(write stream)', function(done) {
    var path = __dirname + '/ooxx.download',
      writeStream = fs.createWriteStream(path);

    bcs.getObject({
      bucket: bucketName,
      object: objectName01,
      dest: writeStream
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      result.body.should.equal('write to stream success');
      fs.statSync(path).size.should.equal(fs.statSync(__filename).size);
      fs.readFileSync(path, 'utf8').should.equal(fs.readFileSync(__filename, 'utf8'));
      fs.unlinkSync(path);
      done();
    });
  });

  it('delete object', function(done) {
    var a = [objectName01, objectName02, objectName03, objectName04, objectName05],
      length = a.length,
      count = 0;
    a.forEach(function(eachObjectName) {
      bcs.deleteObject({
        bucket: bucketName,
        object: eachObjectName
      }, function(error, result) {
        should.not.exist(error);
        result.status.should.equal(200);
        count++;
        if (count === length) {
          done();
        }
      });
    });
  });

  it('delete bucket', function(done) {
    bcs.deleteBucket({
      bucket: bucketName
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });
});

describe('acl', function() {
  var bucketName = 'bucket' + uid.v4();

  it('put bucket with acl', function(done) {
    bcs.putBucket({
      bucket: bucketName,
      acl: 'public-read'
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('get bucket acl', function(done) {
    bcs.getAcl({
      bucket: bucketName
    }, function(error, result) {
      should.not.exist(error);
      result.body.statements.length.should.above(0);
      done();
    });
  });

  it('put bucket acl', function(done) {
    bcs.putAcl({
      bucket: bucketName,
      acl: 'private'
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });

  it('delete bucket', function(done) {
    bcs.deleteBucket({
      bucket: bucketName
    }, function(error, result) {
      should.not.exist(error);
      result.status.should.equal(200);
      done();
    });
  });
});

describe('bcs error handle', function() {
  it('get bucket acl, should error', function(done) {
    bcs.getAcl({
      bucket: 'invalidBucketName'
    }, function(error, result) {
      should.exist(error);
      should.not.exist(result);
      error.status.should.equal(400);
      error.code.should.equal('-1000');
      done();
    });
  });

  it('put object with invalid file path', function(done) {
    bcs.putObject({
      bucket: 'bucketName',
      object: 'objectName',
      source: '/xxoo'
    }, function(error) {
      should.exist(error);
      error.message.should.equal('ENOENT, stat \'/xxoo\'');
      done();
    });
  });

  it('invalid bcs client - key', function(done) {
    var invalidClient = BCS.createClient({
      access: 'accessKey',
      secretKey: 'secretKey',
      time: 5000,
      ip: '1.0.0.1',
      size: 5000,
      agent: false
    });

    invalidClient.listBucket(function(error, result) {
      should.exist(error);
      should.not.exist(result);
      error.status.should.equal(403);
      error.code.should.equal('-19');
      done();
    });
  });

  it('invalid bcs client - host', function(done) {
    var invalidClient = BCS.createClient({
      access: 'accessKey',
      secretKey: 'secretKey',
      host: 'localhost',
      time: 5000,
      ip: '1.0.0.1',
      size: 5000,
      agent: false
    });

    invalidClient.listBucket(function(error, result) {
      should.exist(error);
      should.not.exist(result);
      done();
    });
  });
});
