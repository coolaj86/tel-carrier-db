# tel-carrier-db

A static cache of <http://fonefinder.net>'s database, adapted for use with Node.js.

## Usage

```bash
npm install --save tel-carrier-db
```

```javascript
(function () {
  'use strict';

  var telDb = require('tel-carrier-db')
    , info
    ;

                    // country, area code, prefix, exchange/subscriber/line
  info = telDb.lookup('1', '801', '360', '5555');
  if (info) {
    console.log(info);
  } else {
    console.log('Not found');
  }
}());
```

Example Output:

```json
{ "number": "+18013605555"
, "city": "PROVO"
, "state": "Utah"
, "st": "UT"
, "company": "CELLCO PARTNERSHIP DBA VERIZON WIRELESS - UT"
, "type": "WIRELESS PROV"
, "carrier": "verizon"
, "carrierName": "Verizon"
, "link": "http://www.verizonwireless.com"
, "wireless": true
}
```

Note that the `country` parameter is ignored.
Only US numbers are supported at this time.

Also note that `carrier`, `link`, and `wireless` may be empty strings or undefined.

## Update the Database

This tool is used to scrape the nanp nxx database used by
[`tel-carrier`](https://github.com/coolaj86/node-tel-carrier)

Here's the process:

### \#1 Installation

```bash
git clone git@github.com:coolaj86/nxx-lookup.git
pushd nxx-lookup
npm install --dev
```
### \#2 Download the database

```bash
node ./download
```

This will download to `./data` which will result in about 80MiB of html files.

When the download completes it will write out about 5MiB of tables into `data.json`.

That file is an object that looks like this:

```json
{ list: {
    "801": [
      [360,1531,39,39,908,4]
    , ...
    ]
  , ...
  }
, cities: [ "DALLAS", ... ]
, states: [ "Texas", ...]
, sts: [ "TX", ... ]
, companies: [ "CELLCO PARTNERSHIP DBA VERIZON WIRELESS - TX", ... ]
, types: [ "WIRELESS PROV", ... ]
, carriers: [ "verizon", ... ]
, links: [ "http://www.verizonwireless.com", ... ]
}
```

The array inside of `list` is in the following format:

```json
{ "area code": [ ["prefix", "city", "state", "st", "comment", "type"] ] }
```

Note that what may appear to be numeric ids used
for city, state, st, comment, and type are actually **transient**
and you **must not** rely on them -
they're just for the sake of poor-man's compression.

### Porting

No porting information is available at this time.

In the future we may maintain a list of known-ported numbers to exclude from the nxx blocks.
Don't count on it.
