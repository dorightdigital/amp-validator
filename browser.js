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
          errors: []
        };

      browser.visit(url, conf, function () {
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
        console.log('msg', msg);
        var match = msg.match(/– Version (\d+)/);
        if (match) {
          result.ampVersion = parseInt(match[1], 10);
        } else if (msg === 'AMP validation successful.') {
          result.success = true;
        }
      };
      browser.window.console.error = browser.window.console.warn = function (msg) {
        result.success = false;
        result.errors.push(msg);
      };
    });
  }
};
