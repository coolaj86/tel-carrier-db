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
    , links = { map: {}, arr: [] }
    , carriers = { map: {}, arr: [] }
    , types = { map: {}, arr: [] }
    , s = ' '
    , s2 = '  '
    //, s = ''
    //, s2 = ''
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
      , mapData = {}
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

    bigData.forEach(function (bigData) {
      var area = bigData[0]
        ;

      if (!mapData[area]) {
        mapData[area] = [];
      }

      mapData[area].push(bigData);
      bigData.shift();
    });

    ws.write('{' + s + '"list":' + s + '{\n');
    forEachAsync(Object.keys(mapData), function (next, areaCode, i) {
      var list = mapData[areaCode]
        , strs = []
        , sp = '    '
        ;

      ws.write(spacer + '"' + areaCode + '":' + s + '[\n');
      list.forEach(function (d, j) {
        d[0] = parseInt(d[0], 10); // prefix
        d[1] = addThing(d[1], cities); // city name
        d[2] = addThing(d[2], states); // state name
        d[3] = addThing(d[3], sts); // state abbrev
        d[4] = addThing(d[4], comments); // teclo registered
        d[5] = addThing(d[5], types); // telco type
        d[6] = addThing(d[6], links); // carrier link
        d[7] = addThing(d[7], carriers); // carrier

        strs.push(sp + JSON.stringify(d) + '\n');

        if (0 === j) {
          sp = s2 + ',' + s;
        }
      });
      ws.write(strs.join('') + s2 + ']\n', function () {
        console.log('wrote ' + strs.length + '...');
        next();
      });

      if (0 === i) {
        spacer = ',' + s;
      }
    }).then(function () {
      ws.on('close', function () {
        console.log('wrote data.json');
      });

      ws.write(s2 + '}\n');
      ws.write(',' + s + '"types":' + s + JSON.stringify(types.arr) + '\n');
      ws.write(',' + s + '"states":' + s + JSON.stringify(states.arr) + '\n');
      ws.write(',' + s + '"sts":' + s + JSON.stringify(sts.arr) + '\n');
      ws.write(',' + s + '"cities":' + s + JSON.stringify(cities.arr, null, s2) + '\n');
      ws.write(',' + s + '"comments":' + s + JSON.stringify(comments.arr, null, s2) + '\n');
      ws.write(',' + s + '"links":' + s + JSON.stringify(links.arr, null, s2) + '\n');
      ws.write(',' + s + '"carriers":' + s + JSON.stringify(carriers.arr, null, s2) + '\n');
      ws.write('}\n', function () {
        ws.close();
      });
    });
  });
}());
