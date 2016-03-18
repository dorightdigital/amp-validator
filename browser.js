var Browser = require('zombie');
var Promise = require('bluebird');
var conf = {runScripts: true, strictSSL: false};
var _ = require('lodash');

module.exports = {
  visit: function (url) {
    return new Promise(function (res, rej) {
      var browser = new Browser(conf),
        realCreateElement,
        lastKnownStyle,
        intervals = [],
        result = {
          console: {
            errors: [],
            warns: [],
            infos: []
          },
          scriptSrcs: []
        },
        domNodePrototype;

      function onComplete() {
        var i;
        for (i = 0; i < intervals.length; i += 1) {
          clearInterval(intervals[i]);
        }
        browser.window.close();
        res(result);
      }

      browser.visit(url, conf).then(function () {
        result.statusCode = browser.resources[0].response.status;
        Array.prototype.forEach.call(browser.document.querySelectorAll('script'), function (script) {
          result.scriptSrcs.push(script.getAttribute('src'));
        });
        Promise.race([
          new Promise(function (res) {
            setTimeout(res, parseInt(process.env.AMP_VALIDATOR_TIMEOUT || '6000', 10));
          }),
          new Promise(function (res) {
            intervals.push(setInterval(function () {
              if (result.console.infos.length >= 2 || result.console.errors.length > 1) {
                res();
              }
            }, 100));
          })
        ]).then(onComplete);
      }).catch(function (e) {
        rej(e);
      });

      function noop() {
        return;
      }

      realCreateElement = browser.document.createElement;

      browser.document.createElement = function (type) {
        var out = realCreateElement.apply(this, arguments);
        if (type === 'style') {
          lastKnownStyle = out;
        }
        return out;
      };

      domNodePrototype = browser.window.Node.prototype;

      domNodePrototype.classList = domNodePrototype.classList || {};

      _.forEach(['add', 'remove', 'toggle'], function (key) {
        domNodePrototype.classList[key] = domNodePrototype.classList[key] || noop;
      });

      intervals.push(setInterval(function () {
        var i;
        for (i in browser.document.styleSheets) {
          if (browser.document.styleSheets.hasOwnProperty(i)) {
            browser.document.styleSheets[i].ownerNode = lastKnownStyle;
          }
        }
        if (browser.location.hash !== '#development=1') {
          browser.location.hash = '#development=1';
        }
      }, 100));
      browser.window.AMP_TAG = true;
      browser.document.registerElement = function () {
        return true;
      };
      browser.window.console.info = function () {
        result.console.infos.push(arguments);
      };
      browser.window.console.warn = function () {
        result.console.warns.push(arguments);
      };
      browser.window.console.error = function () {
        result.console.errors.push(arguments);
      };
    });
  }
};
