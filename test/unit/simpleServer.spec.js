/*jlsint expr=1*/
var sinon = require('sinon');
var chai = require('chai');
var http = require('http');
var fs = require('fs');
var sinonChai = require('sinon-chai');
var simpleServer = require('../../simpleServer');
var expect = chai.expect;
chai.use(sinonChai);

describe('Starting server for local files', function () {
  var testScope;
  beforeEach(function () {
    simpleServer.resetSingleton();
    testScope = {
      eventFor: {}
    };
    testScope.listener = sinon.spy();
    testScope.sandbox = sinon.sandbox.create();
    testScope.sandbox.stub(http, 'createServer', function (handler) {
      testScope.serverHandler = handler;
      return {
        listen: testScope.listener,
        on: function (eName, fn) {
          testScope.eventFor[eName] = fn;
        }
      };
    });
    testScope.returnValue = simpleServer.makeSureSimpleServerIsStarted();
  });
  afterEach(function () {
    testScope.sandbox.restore();
  });
  after(function () {
    simpleServer.resetSingleton();
  });
  it('should start a simple server when provided a relative path', function () {
    expect(http.createServer).to.have.been.called;
    expect(testScope.listener).to.have.been.calledWith(30000);
  });
  it('should be singleton', function () {
    var result1 = simpleServer.makeSureSimpleServerIsStarted();
    var result2 = simpleServer.makeSureSimpleServerIsStarted();

    expect(result1).to.eq(result2);
  });
  it('should return a promise', function () {
    simpleServer.makeSureSimpleServerIsStarted();

    expect(typeof testScope.returnValue.done).to.eq('function');
    expect(typeof testScope.returnValue.catch).to.eq('function');
  });
  it('should increment port if unavailable', function (done) {
    http.createServer.reset();
    testScope.listener.reset();

    testScope.returnValue.then(function (config) {
      expect(config.port).to.eq(30001);
      done();
    }).catch(done);

    testScope.eventFor.error({code: 'EADDRINUSE'});

    expect(testScope.listener).to.have.been.calledWith(30001);
  });
  it('should keep incrementing when port is unavailable', function (done) {
    http.createServer.reset();
    testScope.listener.reset();

    testScope.returnValue.then(function (config) {
      expect(config.port).to.eq(30004);
      done();
    }).catch(done);

    testScope.eventFor.error({code: 'EADDRINUSE'});
    expect(testScope.listener).to.have.been.calledWith(30001);
    testScope.listener.reset();
    testScope.eventFor.error({code: 'EADDRINUSE'});
    expect(testScope.listener).to.have.been.calledWith(30002);
    testScope.listener.reset();
    testScope.eventFor.error({code: 'EADDRINUSE'});
    expect(testScope.listener).to.have.been.calledWith(30003);
    testScope.listener.reset();
    testScope.eventFor.error({code: 'EADDRINUSE'});
    expect(testScope.listener).to.have.been.calledWith(30004);

  });
  it('should throw other errors', function () {
    var err = {code: 'ABCD', a: 'b', c: 'd'};
    expect(function () {
      testScope.eventFor.error(err);
    }).to.throw(err);
  });
  describe('file http server', function () {
    beforeEach(function () {
      testScope.sandbox.stub(process, 'cwd').returns('/some/known/path');
      testScope.sandbox.stub(fs, 'readFile', function (path, callback) {
        if (path === '/some/known/path/abc') {
          callback(undefined, 'content');
        } else if (path === '/a/different/path/def') {
          callback(undefined, 'some other content');
        } else {
          callback({some: 'error'}, 'not the right content');
        }
      });
      testScope.res = {writeHead: sinon.spy(), end: sinon.spy()};
    });

    it('should serve local files', function () {
      var req = {url: '/abc'};

      testScope.serverHandler(req, testScope.res);

      expect(testScope.res.writeHead).to.have.been.calledWith(200, {'content-type': 'text/html'});
      expect(testScope.res.end).to.have.been.calledWith('content');
    });

    it('should serve local files - example 2', function () {
      process.cwd.returns('/a/different/path');
      var req = {url: '/def'};

      testScope.serverHandler(req, testScope.res);

      expect(testScope.res.writeHead).to.have.been.calledWith(200, {'content-type': 'text/html'});
      expect(testScope.res.end).to.have.been.calledWith('some other content');
    });

    it('should serve local files', function () {
      var req = {url: '/not-found'};

      testScope.serverHandler(req, testScope.res);

      expect(testScope.res.writeHead).to.have.been.calledWith(404);
      expect(testScope.res.end).to.have.been.calledWith('Not Found');
    });
  });
});

