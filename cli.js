#! /usr/bin/env node

var Promise = require('bluebird');
var program = require('commander');
var colors = require('colors');
var formatJson = require('format-json');
var core = require('./core');
var _ = require('lodash');

function createTextFormatter(successColor, failColor) {
  return function (results) {
    return _.map(results, function (result, url) {
      return result.success ? successColor(url + ' passed validation') : failColor(url + ' failed validation');
    }).join('\n');
  };
}

function noop(a) {
  return a;
}

var formatters = {
  json: formatJson.plain,
  text: createTextFormatter(colors.green, colors.red),
  'colorless-text': createTextFormatter(noop, noop)
};

program
  .version('0.1.0')
  .usage('[options] <file ...>')
  .option('-o, --output <json|text|colorless-text>', 'The format of the output')
  .parse(process.argv);

Promise.all(_.map(program.args, function (url) {
  return core.validate(url).then(function (result) {
    return {
      originalUrl: url,
      result: result
    };
  });
})).then(function (data) {
  var out = {};
  _.each(data, function (result) {
    out[result.originalUrl] = result.result;
  });
  return out;
}).then(function (results) {
  if (program.format === undefined || program.format.toLowerCase() === 'json') {
    console.log(formatters[(program.output || 'text').toLowerCase()](results));
    _.each(results, function (result) {
      if (!result.success) {
        process.exit(1);
      }
    });
    process.exit(0);
  }
}).done();

//var url = process.argv[2];
