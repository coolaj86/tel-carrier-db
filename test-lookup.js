'use strict';

var telDb = require('./tel-carrier-db')
  , info
  ;

info = telDb.lookup(1, 801, 360, 5555);
console.log(info);

// "385": [722,5338,15,15,1892,1,25,3,3]
info = telDb.lookup(1, 385, 722, 5555);
console.log(info);
