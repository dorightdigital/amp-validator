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
          console: {
            errors: [],
            infos: []
          },
          scriptSrcs: [],
          ampVersion: {}
        };

      browser.visit(url, conf, function () {
        result.statusCode = browser.resources[0].response.status;
        Array.prototype.forEach.call(browser.document.querySelectorAll('script'), function (script) {
          result.scriptSrcs.push(script.getAttribute('src'));
        });
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
      browser.window.console.info = function () {
        result.console.infos.push(arguments);
      };
      browser.window.console.error = browser.window.console.warn = function () {
        result.console.errors.push(arguments);
      };
    });
  }
};
