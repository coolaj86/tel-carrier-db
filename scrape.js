'use strict';

function scrape(html) {
  var arr = []
    , rows
    ;

  if (/Sorry, no records found/.test(html)) {
    return null;
  }

  // there's tons of malformed html, let's level the playing field
  html = html.replace(/[\s\S]+(<TABLE[\s\S]+?TABLE>)[\s\S]+/g, '$1');
  html = html.replace(/<TH[\s\S]+?<TR>/g, '<TR>');
  rows = html.split(/<TR>/ig);
  rows.shift(); // TABLE open + header
  rows.pop(); // TABLE close

  //console.log(rows.join('\n\n'));
  rows.forEach(function (row) {
    var cols = row.split(/<TD>/ig)
      , linkHrefRe = /<A.*?HREF='([^']*)'.*/
      , linkTitleRe = /<A[^>]*>([^<]+)(<\/A>)?/
      , area
      , prefix
      , city
      , state
      , st
      , company
      , type
      , carrier
      , carrierLink
      ;

    cols.shift();
    // <A HREF='findareacode.php?areacode=972'>972</A>[ ]<A HREF='findome.php?npa=&nxx=360&usaquerytype=Search+by+Number'>360[  ]<A HREF='findcity.php?cityname=DALLAS&state=TX'>DALLAS[  ]<A HREF='shownpamap.php?graphic=http://fonefinder.net/images/npamap/tx.gif'>Texas</A>[ ]<A HREF='http://fonefinder.net/att.php'>AT&T LOCAL</A>[  ]CLEC[  ]<A HREF='findome.php?npa=972&nxx=360&usaquerytype=Search+by+Number'>More</A>
    //console.log(cols.join('[\t]'), '\n');
    area = cols[0].replace(linkTitleRe, '$1');
    prefix = cols[1].replace(linkTitleRe, '$1');
    city = cols[2].replace(linkTitleRe, '$1');
    st = cols[2].replace(/.*state=(\w+).*/, '$1');
    state = cols[3].replace(linkTitleRe, '$1');
    company = cols[4].replace(linkTitleRe, '$1');
    carrierLink = cols[4].replace(linkHrefRe, '$1');
    if (!/^http/.test(carrierLink)) {
      carrierLink = '';
    } else {
      carrier = carrierLink.replace(/.*fonefinder.net\/(.*).php/, '$1');
      if (carrierLink === carrier) {
        carrier = '';
      }
    }
    type = cols[5] || '';

    if (/fonefinder/.test(carrierLink)) {
      carrierLink = '';
    }
    arr.push([area, prefix, city, state, st, company, type, carrierLink, carrier]);
  });

  return arr;
}

module.exports.scrape = scrape;
