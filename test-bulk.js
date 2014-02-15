'use strict';

var fs = require('fs')
  , telDb = require('./tel-carrier-db')
  , filepath = process.argv[2]
  , tried = {}
  ;

if (!filepath) {
  console.log('Usage: node test-bulk ./path/to/file.txt');
  return;
}

fs.readFile(filepath, 'utf8', function (err, data) {
  var lines
    ;

  lines = data.trim().split(/[,\n]/g);
  lines.forEach(function (line) {
    var num = /(?=\D|\b)(?=\+?1[\-\.\s]?)?\s*[\-\.\s\(]?\s*(\d{3})\s*[\-\.\s\)]?\s*(\d{3})\s*[\-\.\s]?\s*(\d{4})(?=\D|\b)/.exec(line)
      , info
      ;

    if (!num) {
      console.log(line, 'is bunk');
      return;
    }

    if (tried[num[1].toString() + num[2] + num[3]]) {
      return;
    }

    info = telDb.lookup('1', num[1], num[2], num[3]);
    if (!info) {
      return;
    }

    tried[num[1].toString() + num[2] + num[3]] = true;
    console.log(info);
  });
});
