//This is a phantomJS script that takes a screenshot of a page
//Use it from the command line with:
//phantomjs screenshot.js <some URL>
//For example:
//phantomjs screenshot.js http://github.com

var page = require('webpage').create(),
  system = require('system'),
  address;

if (system.args.length === 1) {
  console.log('ERROR. Correct usage: screenshot.js <some URL>');
  phantom.exit();
}

address = system.args[1];

page.open(address, function(status) {
  if (status !== 'success') {
    console.log("FAIL to load the address '"+address+"'");
  } else {
    //Remove http from the filename
    address = address.replace("http://","");
    //Remove slashes from the filename
    address = address.replace("/","-");
    //Take a snapshot
    page.render('phantom-screen-shot/'+address+'.png');
  }
  phantom.exit();
});