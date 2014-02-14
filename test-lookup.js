'use strict';

var telDb = require('./tel-carrier-db')
  , info
  ;

info = telDb.lookup(1, 801, 360, 5555);
console.log(info);

//console.log(lookup(1, '801', '360', '5555'));
