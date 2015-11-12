var expect = require('chai').expect;
var core = require('../../core');

xdescribe('Validator Functions', function () {
  it('should mark validation successes', function (done) {
    core.validate('test/fixtures/valid/articleNoViewport.html').then(function (result) {
      expect(result.success).to.eq(true);
      expect(result.errors).to.eql([]);
      expect(result.ampVersion).to.eq(1446675574301);
      done();
    }).catch(done);
  });
  it('should mark validation failures - no viewport', function (done) {
    core.validate('test/fixtures/invalid/articleNoViewport.html').then(function (result) {
      expect(result.success).to.eq(false);
      expect(result.errors).to.eql(['MANDATORY_TAG_MISSING viewport declaration (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#vprt)']);
      expect(result.ampVersion).to.eq(1446675574301);
      done();
    }).catch(done);
  });
  it('should mark validation failures - no styles', function (done) {
    core.validate('test/fixtures/invalid/articleNoStyle.html').then(function (result) {
      expect(result.success).to.eq(false);
      expect(result.errors).to.eql([
        'MANDATORY_TAG_MISSING mandatory style (js enabled) opacity 0 (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)',
        'MANDATORY_TAG_MISSING mandatory style (noscript) opacity 1 (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)',
        'MANDATORY_TAG_MISSING noscript enclosure for mandatory style (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)'
      ]);
      expect(result.ampVersion).to.eq(1446675574301);
      done();
    }).catch(done);
  });
});

