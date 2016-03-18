var expect = require('chai').expect;
var core = require('../../core');
var simpleServer = require('../../simpleServer');

describe('Validator Functions', function () {
  beforeEach(function (done) {
    var that = this;
    simpleServer.resetSingleton();
    simpleServer.makeSureSimpleServerIsStarted().then(function (serverConf) {
      that.baseUrl = 'http://localhost:' + serverConf.port;
      done();
    });
  });
  it('should mark validation successes', function (done) {
    core.validate(this.baseUrl + '/test/fixtures/valid/article.html').then(function (result) {
      expect(result.errors).to.eql([]);
      expect(result.success).to.eql(true);
      done();
    }).catch(done);
  });
  xit('should mark validation failures - no style', function (done) {
    core.validate(this.baseUrl + '/test/fixtures/invalid/articleNoStyle.html').then(function (result) {
      expect(result.success).to.eql(false);
      expect(result.errors).to.eql([
        {
          "line": 10,
          "char": 6,
          "reason": "The mandatory tag 'noscript enclosure for boilerplate' is missing or incorrect. (see https://www.ampproject.org/docs/reference/spec.html#required-markup)"
        },
        {
          "line": 10,
          "char": 6,
          "reason": "The mandatory tag 'head > style : boilerplate' is missing or incorrect. (see https://www.ampproject.org/docs/reference/spec.html#required-markup)"
        },
        {
          "line": 10,
          "char": 6,
          "reason": "The mandatory tag 'noscript > style : boilerplate' is missing or incorrect. (see https://www.ampproject.org/docs/reference/spec.html#required-markup)"
        }
      ]);
      done();
    }).catch(done);
  });
  xit('should mark validation failures - extra script tag', function (done) {
    core.validate(this.baseUrl + '/test/fixtures/invalid/extraScript.html').then(function (result) {
      console.log(result);
      expect(result.success).to.eq(false);
      expect(result.errors).to.eql([
        {
          "line": 4,
          "char": 2,
          "reason": "The tag 'script' is disallowed except in specific forms."
        }
      ]);
      done();
    }).catch(done);
  });
  xit('should mark validation failures - not an AMP Document', function (done) {
    core.validate(this.baseUrl + '/test/fixtures/invalid/notAmp.html').then(function (result) {
      expect(result.errors).to.eql([]);
      expect(result.success).to.eq(undefined);
      expect(result.ampVersion).to.eql({
        "declared": "none"
      });
      done();
    }).catch(done);
  });
});

