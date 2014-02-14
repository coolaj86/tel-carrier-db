(function () {
  'use strict';

  var request = require('request')
    , fs = require('fs')
    , path = require('path')
    , scrape = require('./scrape').scrape
    , forEachAsync = require('foreachasync').forEachAsync
    , nxxs = []
    , randomNxxs
    , i
    , bigData = []
    //
    , cities = { map: {}, arr: [] }
    , states = { map: {}, arr: [] }
    , sts = { map: {}, arr: [] }
    , comments = { map: {}, arr: [] }
    , types = { map: {}, arr: [] }
    ;

  function pad(str) {
    str = str.toString();

    while (str.toString().length < 3) {
      str = '0' + str;
    }

    return str;
  }

  // NOTE these are not ideas, they will change with each update
  function addThing(str, t) {
    // account for falsey 0
    if ('number' !== typeof t.map[str]) {
      t.map[str] = t.arr.length;
      t.arr.push(str);
    }

    return t.map[str]; 
  }

  for (i = 0; i <= 999; i += 1) {
    nxxs.push(pad(i));
  }

  randomNxxs = nxxs.slice(0).sort(function () { return 0.5 - Math.random(); });

  forEachAsync(randomNxxs, function (next, nxx, i) {
    var filepath = path.join(__dirname, 'data', nxx + '.html')
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
  }).then(function () {
    var ws
      , spacer = '  '
      , stuff = []
      ;

    nxxs.forEach(function (nxx, i) {
      var code = scrape(nxx.data)
        ;

      if (!code) {
        console.log(pad(i), 'is bunk');
        return;
      }

      bigData = bigData.concat(code);
    });

    ws = fs.createWriteStream('data.json');

    console.log(bigData.length, 'lines to write...');

    ws.write('{ list: [\n');
    forEachAsync(bigData, function (next, d, i) {
      d[0] = parseInt(d[0], 10); // area code
      d[1] = parseInt(d[1], 10); // prefix
      d[2] = addThing(d[2], cities); // city name
      d[3] = addThing(d[3], states); // state name
      d[4] = addThing(d[4], sts); // state abbrev
      d[5] = addThing(d[5], comments); // teclo registered
      d[6] = addThing(d[6], types); // telco type
      stuff.push(spacer + JSON.stringify(d) + '\n');
      if (stuff.length > 1000) {
        ws.write(stuff.join(''), function () {
          next();
        });
        stuff = [];
        console.log('wrote 1000...');
        return;
      }
      if (0 === i) {
        spacer = ', ';
      }
      next();
    }).then(function () {
      ws.on('close', function () {
        console.log('wrote data.json');
      });


      ws.write(stuff.join('') + ']\n\n');
      ws.write(', types: ' + JSON.stringify(types.arr) + '\n');
      ws.write(', states: ' + JSON.stringify(states.arr) + '\n');
      ws.write(', sts: ' + JSON.stringify(sts.arr) + '\n');
      ws.write(', cities: ' + JSON.stringify(cities.arr, null, '  ') + '\n');
      ws.write(', comments: ' + JSON.stringify(comments.arr, null, '  ') + '\n');
      ws.write('}\n', function () {
        ws.close();
      });
    });
  });
}());
