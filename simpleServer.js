var Promise = require('bluebird');
var http = require('http');
var fs = require('fs');

var singletonResponse;

module.exports = {
  makeSureSimpleServerIsStarted: function () {
    if (singletonResponse) {
      return singletonResponse;
    }
    var obj = {port: 30000},
      server = http.createServer(function (req, res) {
        var file = [process.cwd(), req.url].join('');
        fs.readFile(file, function (err, content) {
          if (err) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, {'content-type': 'text/html'});
            res.end(content);
          }
        });
      });
    server.on('error', function (err) {
      if (err.code !== 'EADDRINUSE') {
        throw err;
      }
      obj.port += 1;
      server.listen(obj.port);
    });
    server.listen(obj.port);

    singletonResponse = Promise.resolve(obj);
    return singletonResponse;
  },
  resetSingleton: function () {
    singletonResponse = undefined;
  }
};
module.exports.makeSureSimpleServerIsStarted();