(function () {
  'use strict';

  var request = require('request')
    , bigCallback
    , linkOverrides = require('./link-overrides')
    , carrierOverrides = require('./carrier-overrides')
    , fs = require('fs')
    , path = require('path')
    , scrape = require('./scrape').scrape
    , scrapeLink = require('./parse-link-page').parse
    , forEachAsync = require('foreachasync').forEachAsync
    , nxxs = []
    , randomNxxs
    , i
    , bigData = []
    , carrierLinkMap = {}
    ;

  function pad(str) {
    str = str.toString();

    while (str.toString().length < 3) {
      str = '0' + str;
    }

    return str;
  }

  function downloadData(next, nxx, i) {
    var filepath = path.join(__dirname, 'data', 'prefixes', nxx + '.html')
      ;

    if (fs.existsSync(filepath)) {
      console.log('(' + pad(i) + ')', filepath);
      fs.readFile(filepath, 'utf8', function (err, data) {
        nxxs[i] = { nxx: nxx, data: data };
        next();
      });
      return;
    }

    request.get(
      'http://www.fonefinder.net/findome.php?npa=&nxx=' + nxx + '&usaquerytype=Search+by+Number'
    , function (err, req, data) {
        console.log('[' + pad(i) + ']', filepath);
        fs.writeFile(filepath, data, 'utf8', function () {
          nxxs[i] = { nxx: nxx, data: data };
          next();
        });
      }
    );
  }

  function getRealCarrierName(carrierLink, fn) {
    var carrier
      , filepath
      ;

    if (!carrierLink || !/fonefinder/.test(carrierLink)) {
      fn({ link: carrierLink });
      return;
    }

    if (carrierLinkMap[carrierLink]) {
      fn(carrierLinkMap[carrierLink]);
      return;
    }

    function getLink(data) {
      var obj = scrapeLink(data)
        ;

      carrierLinkMap[carrierLink] = obj;
      fn(obj);
    }

    carrier = carrierLink.replace(/.*fonefinder.net\/(.*).php/, '$1');
    filepath = path.join(__dirname, 'data', 'carriers', carrier + '.html');
    if (!fs.existsSync(filepath)) {
      console.log('GET', filepath.split(/\//).pop());
      request.get(carrierLink, function (err, req, data) {
        fs.writeFile(filepath, data, 'utf8', function (err) {
          if (err) {
            console.log(carrierLink);
            console.log(data);
            console.error('great sadness');
            console.error(err);
            return;
          }
          getLink(data);
        });
      });
    } else {
      console.log('GOT', filepath.split(/\//).pop());
      fs.readFile(filepath, 'utf8', function (err, data) {
        if (err) {
          console.error('greatest sadness');
          console.error(err);
          return;
        }
        getLink(data);
      });
    }
  }

  function saveData() {
    forEachAsync(nxxs, function (next, nxx, i) {
      var code = scrape(nxx.data)
        ;

      if (!code) {
        console.log(pad(i), 'is bunk');
        next();
        return;
      }

      forEachAsync(code, function (n, row) {
        // HERE
        if (linkOverrides[row[8]]) {
          row[7] = linkOverrides[row[8]];
          bigData.push(row);
          n();
          return;
        }
        if (carrierOverrides[row[8]]) {
          row[8] = carrierOverrides[row[8]];
        }
        getRealCarrierName(row[7], function (obj) {
          row[7] = obj.link; // overwrite psuedolink
          row[9] = obj.name; // add yet another carrier / company name
          bigData.push(row);
          n();
        });
      }).then(function () {
        next();
      });
    }).then(function () {
      var arr = []
        , sp = '  '
        , ws
        ;

      console.log('writing `sheet.json`...');

      ws = fs.createWriteStream('sheet.json');
      ws.write('[\n');
      bigData.forEach(function (line, i) {
        arr.push(sp + JSON.stringify(line) + '\n');
        if (arr.length >= 10000) {
          ws.write(arr.join(''));
          arr = [];
        }
        if (0 === i) {
          sp = ', ';
        }
      });
      ws.write(arr.join(''));
      ws.write(']\n', function () {
        bigCallback(bigData);
      });
    });
  }

  function run(_bigCallback) {
    var noop = function () {}
      ;

    bigCallback = _bigCallback || noop;

    for (i = 0; i <= 999; i += 1) {
      nxxs.push(pad(i));
    }

    randomNxxs = nxxs.slice(0).sort(function () { return 0.5 - Math.random(); });

    if (!fs.existsSync('sheet.json')) {
      forEachAsync(randomNxxs, downloadData).then(saveData);
    } else {
      if (noop === bigCallback) {
        console.log('download is already complete');
        return;
      }
      console.log('reading `sheet.json`, this may take several seconds...');
      bigData = require('./sheet.json');
      bigCallback(bigData);
    }
  }

  module.exports.getSheet = run;

  if (require.main === module) {
    run();
  }
}());
