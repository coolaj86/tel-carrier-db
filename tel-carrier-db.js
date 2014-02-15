'use strict';

var data = require('./data.json')
  , meta = require('./meta.json')
  ;

function lookup(country, area, pre, ex) {
  var thing
    ;

  pre = parseInt(pre, 10);
  if (!data.list[area]) {
    //console.log('bad area code', area);
    return null;
  }
  data.list[area].some(function (d) {
    // 0,   1,    2,     3,  4,       5
    // pre, city, state, st, comment, type
    if (d[0] === pre) {
      thing = {
        number: '+1' + area.toString() + pre + ex
      , city: meta.cities[d[1]]
      , state: meta.states[d[2]]
      , st: meta.sts[d[3]]
      , company: meta.companies[d[4]]
      , type: meta.types[d[5]]
      , carrier: meta.carriers[d[7]]
      , carrierName: meta.carrierNames[d[8]] || d[8]
      , link: meta.links[d[6]]
      , wireless: /wireless|pcs/i.test(meta.types[d[5]]) || /wireless|pcs/i.test(meta.companies[d[4]]) || undefined
      };
      return true;
    }
  });

  return thing;
}

module.exports.lookup = lookup;
