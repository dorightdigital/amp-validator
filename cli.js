#! /usr/bin/env node

var Promise = require('bluebird');
var program = require('commander');
var formatJson = require('format-json');
var core = require('./core');

program
  .version('0.1.0')
  .usage('[options] <file ...>')
  .option('-f, --format', 'The format of the output')
  .parse(process.argv);

Promise.all(program.args.map(function (url) {
  return core.validate(url).then(function (result) {
    return {
      originalUrl: url,
      result: result
    };
  });
})).then(function (data) {
  var out = {};
  data.forEach(function (result) {
    out[result.originalUrl] = result.result;
  });
  return out;
}).then(function (results) {
  if (program.format === undefined || program.format.toLowerCase() === 'json') {
    var i;
    console.log(formatJson.plain(results));
    for (i in results) {
      if (results.hasOwnProperty(i)) {
        if (!results[i].success) {
          process.exit(1);
        }
      }
    }
    process.exit(0);
  }
}).done();

//var url = process.argv[2];
