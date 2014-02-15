'use strict';

var data = require('./data.json')
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
      , city: data.cities[d[1]]
      , state: data.states[d[2]]
      , st: data.sts[d[3]]
      , company: data.companies[d[4]]
      , type: data.types[d[5]]
      , carrier: data.carriers[d[7]]
      , link: data.links[d[6]]
      , wireless: /wireless|pcs/i.test(data.types[d[5]]) || /wireless|pcs/i.test(data.companies[d[4]]) || undefined
      };
      return true;
    }
  });

  return thing;
}

module.exports.lookup = lookup;
