var Browser = require('zombie');
var Promise = require('bluebird');
var conf = {runScripts: true, strictSSL: false};


module.exports = {
  visit: function (url) {
    return new Promise(function (res) {
      var browser = new Browser(conf),
        realCreateElement,
        lastKnownStyle,
        result = {
          errors: [],
          ampVersion: {}
        };

      browser.visit(url, conf, function () {
        var script = browser.document.querySelectorAll('script'),
          match;
        Array.prototype.forEach.call(script, function (script) {
          if (match) {
            return;
          }
          var src = script.getAttribute('src');
          match = src && src.match(/https:\/\/cdn\.ampproject\.org\/([\w]+)\.js/);
        });
        result.ampVersion.declared = (match && match[1]) || 'none';
        res(result);
      });

      realCreateElement = browser.document.createElement;

      browser.document.createElement = function (type) {
        var out = realCreateElement.apply(this, arguments);
        if (type === 'style') {
          lastKnownStyle = out;
        }
        return out;
      };
      setInterval(function () {
        var i;
        for (i in browser.document.styleSheets) {
          if (browser.document.styleSheets.hasOwnProperty(i)) {
            browser.document.styleSheets[i].ownerNode = lastKnownStyle;
          }
        }
        if (browser.location.hash !== '#development=1') {
          browser.location.hash = '#development=1';
        }
      }, 100);
      browser.window.AMP_TAG = true;
      browser.document.registerElement = function () {
        return true;
      };
      browser.window.console.info = function (msg) {
        var match = msg.match(/– Version (\d+)/);
        if (match) {
          result.ampVersion.precise = parseInt(match[1], 10);
          result.ampVersion.releaseDate = JSON.parse(JSON.stringify(new Date(result.ampVersion.precise)));
        } else if (msg === 'AMP validation successful.') {
          result.success = true;
        }
      };
      browser.window.console.error = browser.window.console.warn = function (msg) {
        var match = msg.match(/[\w:\-]#development=1:(\d+):(\d+) ([\w\-\s#'"\(:\/\.\)]+)/);
        result.success = false;
        if (match) {
          result.errors.push({
            line: parseInt(match[1], 10),
            char: parseInt(match[2], 10),
            reason: match[3]
          });
        }
      };
    });
  }
};
