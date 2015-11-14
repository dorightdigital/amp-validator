var expect = require('chai').expect;
var core = require('../../core');
var simpleServer = require('../../simpleServer');
var ampVersionObj = {
  declared: 'v0',
  precise: 1447372082206,
  releaseDate: '2015-11-12T23:48:02.206Z'
};

xdescribe('Validator Functions', function () {
  beforeEach(function () {
    simpleServer.resetSingleton();
  });
  it('should mark validation successes', function (done) {
    core.validate('test/fixtures/valid/article.html').then(function (result) {
      expect(result).to.eql({
        success: true,
        errors: [],
        ampVersion: ampVersionObj
      });
      done();
    }).catch(done);
  });
  it('should mark validation failures - no viewport', function (done) {
    core.validate('test/fixtures/invalid/articleNoViewport.html').then(function (result) {
      expect(result).to.eql({
        success: false,
        errors: [
          {
            reason: 'MANDATORY_TAG_MISSING viewport declaration (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#vprt)',
            line: 9,
            char: 6
          }
        ],
        ampVersion: ampVersionObj
      });
      done();
    }).catch(done);
  });
  it('should mark validation failures - no styles', function (done) {
    core.validate('test/fixtures/invalid/articleNoStyle.html').then(function (result) {
      expect(result).to.eql({
        errors: [
          {
            line: 10,
            char: 6,
            reason: 'MANDATORY_TAG_MISSING mandatory style (js enabled) opacity 0 (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)'
          },
          {
            line: 10,
            char: 6,
            reason: 'MANDATORY_TAG_MISSING mandatory style (noscript) opacity 1 (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)'
          },
          {
            line: 10,
            char: 6,
            reason: 'MANDATORY_TAG_MISSING noscript enclosure for mandatory style (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)'
          }
        ],
        ampVersion: ampVersionObj,
        success: false
      });
      done();
    }).catch(done);
  });
});

