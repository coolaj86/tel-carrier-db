'use strict';

var forEachAsync = require('foreachasync').forEachAsync
  ;

function parse(data) {
  var line = data.replace(/[\s\S]*<font size="10">([\s\S]*?)<\/font>[\s\S]*/, '$1').trim()
    , link
    , name
    ;

  line = line
    .replace(/<\/a>/g, ' ')
    .replace(/<br>/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    ;

  //console.log('[line]', line);
  link = line.replace(/.*href="(.*?)".*/, '$1');
  line = line.replace(/<a.*?>/, ' ').replace(/\s+/g, ' ');
  if (!/http/.test(link)) {
    link = '';
  }
  name = line.replace(/.*Phone Number is\s+([^<]+).*/, '$1').trim();

  //console.log('[link]', link);
  //console.log('[name]', name);

  return { link: link, name: name };
}

function parseAll(buffers) {
  var carriers = []
    ;

  buffers.forEach(function (buffer) {
    var obj = parse(buffer)
      ;

    carriers.push(obj);
  });

  return carriers;
}

function build(dirpath, cb) {
  var fs = require('fs')
    ;

  fs.readdir(dirpath, function (err, nodes) {
    var carriers = []
      ;

    forEachAsync(nodes, function (next, node) {
      if (!/\.html$/.test(node)) {
        next();
        return;
      }

      var filepath = dirpath + '/' + node
        ;

      console.log(filepath);
      fs.readFile(filepath, 'utf8', function (err, data) {
        var obj
          ;

        obj = parse(data);
        obj.carrier = node.replace(/.html/, '');
        carriers.push(obj);
        console.log('');
        next();
      });
    }).then(function () {
      cb(null, carriers);
    });
  });
}

module.exports.parse = parse;
module.exports.parseAll = parseAll;
module.exports.build = build;

function run() {
  var fs = require('fs') 
    ;

  build(process.argv[2] || 'data/carriers', function (err, carriers) {
    fs.writeFile('carriers.json', JSON.stringify(carriers, null, '  '), 'utf8', function () {
      console.log('All Done', 'carriers.json');
    });
  });
}

if (require.main === module) {
  run();
}
