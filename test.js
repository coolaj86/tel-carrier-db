'use strict';

var data = require('./data.json')
  , fs = require('fs')
  , tried = {}
  ;

function lookup(area, pre, sw) {
  var thing
    ;

  pre = parseInt(pre, 10);
  if (!data.list[area]) {
    console.log('area', area);
    return;
  }
  data.list[area].some(function (d) {
    // 0,   1,    2,     3,  4,       5
    // pre, city, state, st, comment, type
    if (d[0] === pre) {
      thing = {
        prettyNumber: '(' + area + ') ' + pre + '-' + sw
      , number: area.toString() + pre + sw
      , carrierComment: data.comments[d[4]]
      , typeComment: data.types[d[5]]
      };
      return true;
    }
  });

  return thing;
}

console.log(lookup('801', '360', '5555'));
if (process.argv[2]) {
  fs.readFile(process.argv[2], 'utf8', function (err, data) {
    var lines
      ;

    lines = data.trim().split(/[,\n]/g);
    lines.forEach(function (line) {
      var num = /(?=1-)?\D*(\d{3})\D*(\d{3})\D*(\d{4})\D*/.exec(line)
        ;

      if (!num) {
        console.log(line, 'is bunk');
        return;
      }

      if (tried[num[1].toString() + num[2] + num[3]]) {
        return;
      } else {
        tried[num[1].toString() + num[2] + num[3]] = true;
      }

      console.log(JSON.stringify(lookup(num[1], num[2], num[3]), null, '  '));
    });
  });
}
