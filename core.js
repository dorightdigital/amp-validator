var simpleServer = require('./simpleServer');
var browser = require('./browser');
var Promise = require('bluebird');

module.exports = {
  validate: function (fileOrUrl) {
    var promise = Promise.resolve(fileOrUrl);
    if (fileOrUrl.indexOf('://') === -1) {
      promise = simpleServer.makeSureSimpleServerIsStarted().then(function (conf) {
        return 'http://localhost:' + conf.port + '/' + fileOrUrl;
      });
    }
    return promise.then(function (url) {
      console.log('visiting URL', url);
      return browser.visit(url);
    });
  }
};
