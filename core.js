var browser = require('./browser');
var _ = require('lodash');

module.exports = {
  validate: function (url) {
    return browser.visit(url).then(function (browserResult) {
      var result = {
        ampVersion: {
          declared: 'none'
        },
        errors: []
      };
      if (browserResult.statusCode >= 300 || browserResult.statusCode < 200) {
        result.errors.push({
          line: -1,
          char: -1,
          reason: 'HTTP Status Code ' + browserResult.statusCode + ' was not success range.'
        });
      }
      _.each(browserResult.console.infos, function (args) {
        var msg = args[0],
          match = msg.match(/– Version (\d+)/);
        if (match) {
          result.ampVersion.precise = parseInt(match[1], 10);
          result.ampVersion.releaseDate = JSON.parse(JSON.stringify(new Date(result.ampVersion.precise)));
        } else if (msg === 'AMP validation successful.') {
          result.success = true;
        }
      });
      _.each(browserResult.console.errors, function (args) {
        var msg = args[0],
          match = msg.match(/[\w:\-]:(\d+):(\d+) ([\w\-\s#'"\(:\/\.\)]+)/);
        if (match) {
          result.errors.push({
            line: parseInt(match[1], 10),
            char: parseInt(match[2], 10),
            reason: match[3]
          });
        }
      });
      _.each(browserResult.scriptSrcs, function (src) {
        var match = src && src.match(/https:\/\/cdn\.ampproject\.org\/([\w]+)\.js/);
        if (match) {
          result.ampVersion.declared = match[1];
        }
      });

      if (result.errors.length > 0) {
        result.success = false;
      }
      return result;
    });
  }
};
