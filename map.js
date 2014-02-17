'use strict';

var fs = require('fs')
  , download = require('./download')
  , forEachAsync = require('foreachasync').forEachAsync
  //
  , cities = { map: {}, arr: [] }
  , states = { map: {}, arr: [] }
  , sts = { map: {}, arr: [] }
  , companies = { map: {}, arr: [] }
  , links = { map: {}, arr: [] }
  , carriers = { map: {}, arr: [] }
  , types = { map: {}, arr: [] }
  , carrierNames = { map: {}, arr: [] }
  , s = ' '
  , s2 = '  '
  //, s = ''
  //, s2 = ''
  ;

// NOTE these are not ideas, they will change with each update
function addThing(str, t) {
  // match www. and no www.
  if (!str || 'number' === typeof t.map[str]) {
    str = str;
  } else if ('number' === typeof t.map[str.replace(/\/\/www\./, '//')]) {
    str = str.replace(/\/www\./, '/');
  } else if ('number' === typeof t.map[str.replace(/\/\//, '//www.')]) {
    str = str.replace(/\/\//, '//www.');
  }

  // account for falsey 0
  if ('number' !== typeof t.map[str]) {
    t.map[str] = t.arr.length;
    t.arr.push(str);
  }

  return t.map[str]; 
}

function mapTheData(bigData) {
  var mapData = {}
    ;

  bigData.forEach(function (bigData) {
    var area = bigData[0]
      ;

    if (!mapData[area]) {
      mapData[area] = [];
    }

    mapData[area].push(bigData.slice(1));
    //mapData[area].push(bigData);
    //bigData.shift();
  });

  Object.keys(mapData).forEach(function (areaCode) {
    var list = mapData[areaCode]
      ;

    list.forEach(function (d) {
      d[0] = parseInt(d[0], 10); // prefix
      d[1] = addThing(d[1], cities); // city name
      d[2] = addThing(d[2], states); // state name
      d[3] = addThing(d[3], sts); // state abbrev
      d[4] = addThing(d[4], companies); // teclo registered
      d[5] = addThing(d[5], types); // telco type
      d[6] = addThing(d[6], links); // carrier link
      d[7] = addThing(d[7], carriers); // carrier
      d[8] = addThing(d[8], carrierNames); // carrier
    });
  });

  writeDataFile(mapData);
}

function writeDataFile(mapData) {
  var acWs
    , mWs
    , spacer = '  '
    ;

  acWs = fs.createWriteStream('data.json');
  mWs = fs.createWriteStream('meta.json');
  console.log(Object.keys(mapData), 'area codes to write...');

  acWs.write('{' + s + '"list":' + s + '{\n');
  forEachAsync(Object.keys(mapData), function (next, areaCode, i) {
    var list = mapData[areaCode]
      , strs = []
      , sp = '    '
      ;

    acWs.write(spacer + '"' + areaCode + '":' + s + '[\n');
    list.forEach(function (d, j) {
      strs.push(sp + JSON.stringify(d) + '\n');

      if (0 === j) {
        sp = s2 + ',' + s;
      }
    });
    acWs.write(strs.join('') + s2 + ']\n', function () {
      console.log('wrote ' + strs.length + '...');
      next();
    });

    if (0 === i) {
      spacer = ',' + s;
    }
  }).then(function () {
    acWs.on('close', function () {
      console.log('wrote data.json');
    });
    mWs.on('close', function () {
      console.log('wrote meta.json');
    });

    acWs.write(s2 + '}\n');
    acWs.write('}\n', function () {
      acWs.close();
    });

    mWs.write('{\n');
    mWs.write(     s2 + '"types":' + s + JSON.stringify(types.arr, null, s2) + '\n');
    mWs.write(',' + s + '"states":' + s + JSON.stringify(states.arr, null, s2) + '\n');
    mWs.write(',' + s + '"sts":' + s + JSON.stringify(sts.arr, null, s2) + '\n');
    mWs.write(',' + s + '"cities":' + s + JSON.stringify(cities.arr, null, s2) + '\n');
    mWs.write(',' + s + '"companies":' + s + JSON.stringify(companies.arr, null, s2) + '\n');
    mWs.write(',' + s + '"links":' + s + JSON.stringify(links.arr, null, s2) + '\n');
    mWs.write(',' + s + '"carriers":' + s + JSON.stringify(carriers.arr, null, s2) + '\n');
    mWs.write(',' + s + '"carrierNames":' + s + JSON.stringify(carrierNames.arr, null, s2) + '\n');
    mWs.write('}\n', function () {
      mWs.close();
    });
  });
}

if (require.main === module) {
  download.getSheet(mapTheData);
}
