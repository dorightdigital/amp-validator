#! /usr/bin/env node

var core = require('./core');

var url = process.argv[2];
core.validate(url).then(function (ans) {
  console.log(ans);
  process.exit(ans.success ? 0 : 1);
}).done();
