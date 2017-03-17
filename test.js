const
  assert = require('assert'),
  RMR = require('./index'),
  chai = require('chai'),
  expect = chai.expect;

describe('RMR', function() {
  this.timeout(10000);

  it('RMR.mime', function() {

    expect(RMR.mime.extensionFor('image/png')).to.equal('png');
    expect(RMR.mime.extensionFor('image/tiff')).to.equal('tiff');
    expect(RMR.mime.extensionFor('image/jpg')).to.equal('jpg');
    expect(RMR.mime.extensionFor('image/jpeg')).to.equal('jpg');
    expect(RMR.mime.extensionFor('image/gif')).to.equal('gif');
    expect(RMR.mime.extensionFor('image/vnd.microsoft.icon')).to.equal('ico');
    expect(RMR.mime.extensionFor('image/x-icon')).to.equal('ico');

    expect(RMR.mime.extensionFor('text/html')).to.equal('html');
    expect(RMR.mime.extensionFor('asdfadsf')).to.equal(null);
  });

  it('RMR.url', function() {

    expect(RMR.url.isA('http://google.com')).to.equal(true);
    expect(RMR.url.isA('https://google.com')).to.equal(true);
    expect(RMR.url.isA('abc')).to.equal(false);

  });


  it('RMR.meta', function() {

    RMR.meta.retrieve('https://google.ca').then(function(data) {

      expect(data.title).to.equal('Google'); 
      expect(data.favicon.url).to.equal('https://google.ca/images/branding/product/ico/googleg_lodp.ico');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });

    RMR.meta.retrieve('https://www.apple.com/shop/buy-ipad/ipad-mini-2').then(function(data) {

      expect(data.title).to.equal('Buy iPad mini 2 - Apple'); 
      expect(data.favicon.url).to.equal('https://www.apple.com/favicon.ico');
      expect(data['og:description']).to.equal('iPad mini 2 is available in Silver or Space Gray, a range of storage sizes, and the option to add cellular data capability. View iPad mini 2 and pricing.');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });

    RMR.meta.retrieve('http://readmeansrun.com').then(function(data) {

      expect(data.title).to.equal('READMEANSRUN'); 
      expect(data.favicon.url).to.equal('http://readmeansrun.com/favicon.ico');
      expect(data['og:description']).to.equal('READMEANSRUN makes websites and takes pictures');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });

    RMR.meta.retrieve('http://readmeansrun.com', { icons : false }).then(function(data) {

      expect(data.favicon).to.equal(undefined);

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });

  });

});
