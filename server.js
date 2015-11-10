#! /usr/bin/env node

var Browser = require('zombie');
var colors = require('colors/safe');
var conf = {runScripts: true, strictSSL: false};

var browser = new Browser(conf);

var url = process.argv[2];

if (!url) {
  var error = 'No URL provided';
  console.log(colors.red(error))
  throw new Error(error);
}

if (process.argv[3]) {
  var error = 'Please only provide 1 url - in future releases we hope to support multiple URLs but not yet.';
  console.log(colors.red(error))
  throw new Error(error);
}

var errors = [];
var completedSucccessfulValidation = false;

browser.visit(url, conf, function () {
  if (errors.length > 0) {
    errors.forEach(function (msg) {
      console.error(colors.red(msg));
    });
    process.exit(1);
  }
  function detectDone() {
    if (completedSucccessfulValidation) {
      console.log(colors.green('Valid AMP Article: ' + url));
      process.exit(0);
    }
  };
  setInterval(detectDone);
});

tmp = browser.document.createElement;
var lastKnownStyle;
browser.document.createElement = function (type) {
  var out = tmp.apply(this, arguments);
  if (type === 'style') {
    lastKnownStyle = out;
  }
  return out;
};
setInterval(function () {
  for (var i in browser.document.styleSheets) {
    browser.document.styleSheets[i].ownerNode = lastKnownStyle;
  }
  if (browser.location.hash !== '#development=1') {
    browser.location.hash = '#development=1';
  }
}, 100);
browser.window.AMP_TAG = true;
browser.document.registerElement = function () {};
browser.window.console.info = function (msg) {
  if (msg === 'AMP validation successful.') {
    completedSucccessfulValidation = true;
  }
};
browser.window.console.error = browser.window.console.warn = function (msg) {
  errors.push(msg);
};
