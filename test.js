const
  assert = require('assert'),
  RMR = require('./index'),
  chai = require('chai'),
  expect = chai.expect;

describe('RMR.mime', function() {
  this.timeout(10000);

  it('RMR.mime.extensionFor', function() {

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

  it('RMR.mime.fromPath', function() {

    expect(RMR.mime.fromPath('file.png')).to.equal('image/png');
    expect(RMR.mime.fromPath('styles.css')).to.equal('text/css');

  });


});

describe('RMR.url', function() {

  it('RMR.url', function() {

    expect(RMR.url.isA('http://google.com')).to.equal(true);
    expect(RMR.url.isA('https://google.com')).to.equal(true);
    expect(RMR.url.isA('abc')).to.equal(false);

  });
});


describe('RMR.meta', function() {
  this.timeout(10000);

  it('google.ca', function() {
    return RMR.meta.retrieve('https://google.ca').then(function(data) {

      expect(data.title).to.equal('Google'); 
      expect(data.favicon.url).to.equal('https://www.google.ca/images/branding/product/ico/googleg_lodp.ico');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });


  it('apple store', function() {
    return RMR.meta.retrieve('http://www.apple.com/ipad-pro/').then(function(data) {

      expect(data.title).to.equal('iPad Pro - Apple'); 
      expect(data.favicon.url).to.equal('http://www.apple.com/favicon.ico');
      expect(data['og:description']).to.equal('iPad Pro delivers epic power, in 12.9-inch and 9.7-inch sizes. Discover the A9X Chip, Advanced Retina display, 12MP iSight camera, and more.');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });

  it('RMR', function() {
    return RMR.meta.retrieve('http://readmeansrun.com').then(function(data) {

      expect(data.title).to.equal('READMEANSRUN'); 
      expect(data.favicon.url).to.equal('https://readmeansrun.com/favicon.ico');
      expect(data['og:description']).to.equal('READMEANSRUN makes websites and takes pictures');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });

  it('RMR no icons', function() {
    return RMR.meta.retrieve('http://readmeansrun.com', { icons : false }).then(function(data) {

      expect(data.favicon).to.equal(undefined);

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });
    


});
