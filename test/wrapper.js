'use strict';

var should = require('should'),
  config = require('./config'),
  BCS = require('..'),
  co = require('co');

describe('# thunkify', function() {
  config.wrapper = 'thunk';
  var bcs = BCS.createClient(config);

  it('should list bucket', function(done) {
    co(function * () {
      var result = yield bcs.listBucket();

      result.status.should.equal(200);
      result.body.length.should.above(-1);
    })(done);
  });
});

describe('# promisify', function() {
  config.wrapper = 'promise';
  var bcs = BCS.createClient(config);

  it('should list bucket', function(done) {
    co(function * () {
      var result = yield bcs.listBucket();

      result.status.should.equal(200);
      result.body.length.should.above(-1);
    })(done);
  });
});
