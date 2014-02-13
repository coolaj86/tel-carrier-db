(function () {
  'use strict';

  var request = require('request')
    , fs = require('fs')
    , path = require('path')
    , forEachAsync = require('foreachasync').forEachAsync
    , nxxs = []
    , i
    ;

  function pad(str) {
    str = str.toString();

    while (str.toString().length < 3) {
      str = '0' + str;
    }
    return str;
  }

  for (i = 0; i <= 999; i += 1) {
    nxxs.push(pad(i));
  }

  nxxs.sort(function () { return 0.5 - Math.random(); });

  forEachAsync(nxxs, function (next, nxx, i) {
    var filepath = path.join(__dirname, 'data', nxx + '.html')
      ;

    if (fs.existsSync(filepath)) {
      console.log('(' + pad(i) + ')', filepath);
      next();
      return;
    }

    request.get(
      'http://www.fonefinder.net/findome.php?npa=&nxx=' + nxx + '&usaquerytype=Search+by+Number'
    , function (err, req, data) {
        console.log('[' + pad(i) + ']', filepath);
        fs.writeFile(filepath, data, 'utf8', function () {
          next();
        });
      }
    );
  }).then(function () {
    console.log('done');
  });
}());
