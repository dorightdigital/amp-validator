var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var core = require('../../core');
var simpleServer = require('../../simpleServer');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('Core Library Features', function () {
  var testScope;
  beforeEach(function () {
    testScope = {};
    testScope.sandbox = sinon.sandbox.create();
  });
  afterEach(function () {
    testScope.sandbox.restore();
  });
  it('should start a simple server when provided a relative path', function () {
    testScope.sandbox.spy(simpleServer, 'makeSureSimpleServerIsStarted');
    core.validate('test/fixtures/valid/articleNoViewport.html');
    expect(simpleServer.makeSureSimpleServerIsStarted).to.have.been.called;
  });
  it('should not start a server when provided an http protocol', function () {
    testScope.sandbox.spy(simpleServer, 'makeSureSimpleServerIsStarted');
    core.validate('http://test/fixtures/valid/articleNoViewport.html');
    expect(simpleServer.makeSureSimpleServerIsStarted).not.to.have.been.called;
  });
  it('should not start a server when provided an https protocol', function () {
    testScope.sandbox.spy(simpleServer, 'makeSureSimpleServerIsStarted');
    core.validate('https://test/fixtures/valid/articleNoViewport.html');
    expect(simpleServer.makeSureSimpleServerIsStarted).not.to.have.been.called;
  });
});

