'use strict';

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

  console.log('[line]', line);
  link = line.replace(/.*href="(.*?)".*/, '$1');
  line = line.replace(/<a.*?>/, ' ').replace(/\s+/g, ' ');
  if (!/http/.test(link)) {
    link = '';
  }
  name = line.replace(/.*Phone Number is\s+([^<]+).*/, '$1');

  console.log('[link]', link);
  console.log('[name]', name);

  return { link: link, name: name };
}

module.exports.parse = parse;

function run() {
  var fs = require('fs')
    , dirpath = process.argv[2]
    ;

  fs.readdir(dirpath, function (err, nodes) {
    nodes.forEach(function (node) {
      var filepath = dirpath + '/' + node
        ;

      console.log(filepath);
      parse(fs.readFileSync(filepath, 'utf8'));
      console.log();
    });
  });
}

if (require.main === module) {
  run();
}
