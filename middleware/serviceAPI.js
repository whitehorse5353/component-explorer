var superagent = require('superagent');
var bluebird = require('bluebird');

module.exports.getData = function(url) {
  return new bluebird(function(resolve, reject) {
    superagent.get(url).end(function(err, res) {
      if (err) {
        reject(err);
      }
      resolve(res.body);
    });
  });
};