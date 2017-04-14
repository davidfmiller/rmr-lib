const
  RMR = require('./index'),
  chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect;

describe('RMR.mime', function() {
  this.timeout(10000);

  it('RMR.mime.extensionFor', function extensionFor() {

    expect(RMR.mime.extensionFor('image/png')).to.equal('png');
    expect(RMR.mime.extensionFor('image/tiff')).to.equal('tiff');
    expect(RMR.mime.extensionFor('image/jpeg')).to.equal('jpg');
    expect(RMR.mime.extensionFor('image/gif')).to.equal('gif');
    expect(RMR.mime.extensionFor('image/tiff')).to.equal('tiff');
    expect(RMR.mime.extensionFor('image/vnd.microsoft.icon')).to.equal('ico');
    expect(RMR.mime.extensionFor('image/x-icon')).to.equal('ico');
    expect(RMR.mime.extensionFor('application/xml')).to.equal('xml');
    expect(RMR.mime.extensionFor('text/xml')).to.equal('xml');
    expect(RMR.mime.extensionFor('application/pdf')).to.equal('pdf');
    expect(RMR.mime.extensionFor('image/svg+xml')).to.equal('svg');
    expect(RMR.mime.extensionFor('text/html')).to.equal('html');
    expect(RMR.mime.extensionFor('text/css')).to.equal('css');
    expect(RMR.mime.extensionFor('text/javascript')).to.equal('js');
    expect(RMR.mime.extensionFor('application/json')).to.equal('json');
    expect(RMR.mime.extensionFor('asdfadsf')).to.equal(null);

    expect(RMR.mime.extensionFor('application/rss+xml')).to.equal('rss');
  });

  it('RMR.mime.fromPath', function fromPath() {

    expect(RMR.mime.fromPath('script.js')).to.equal('text/javascript');
    expect(RMR.mime.fromPath('script.json')).to.equal('application/json');

    expect(RMR.mime.fromPath('feed.rss')).to.equal('application/rss+xml');
    expect(RMR.mime.fromPath('image.jpeg')).to.equal('image/jpeg');
    expect(RMR.mime.fromPath('image.jpg')).to.equal('image/jpeg');
    expect(RMR.mime.fromPath('image.gif')).to.equal('image/gif');
    expect(RMR.mime.fromPath('image.png')).to.equal('image/png');
    
    expect(RMR.mime.fromPath('image.svg')).to.equal('image/svg+xml');
    
    expect(RMR.mime.fromPath('page.html')).to.equal('text/html');
    expect(RMR.mime.fromPath('doc.xml')).to.equal('text/xml');
    expect(RMR.mime.fromPath('page.htm')).to.equal('text/html');
    expect(RMR.mime.fromPath('document.pdf')).to.equal('application/pdf');

    expect(RMR.mime.fromPath('image.tiff')).to.equal('image/tiff');
    expect(RMR.mime.fromPath('image.tif')).to.equal('image/tiff');

    expect(RMR.mime.fromPath('styles.css')).to.equal('text/css');
    expect(RMR.mime.fromPath('unknown')).to.equal('application/octet-stream');
  });


});

describe('RMR.url', function() {

  it('RMR.url', function url() {
    expect(RMR.url.isA('http://google.com')).to.equal(true);
    expect(RMR.url.isA('https://google.com')).to.equal(true);
    expect(RMR.url.isA('abc')).to.equal(false);
  });
  
  
});


describe('RMR.meta', function() {
  this.timeout(10000);

  it ('throws', function() {
  
    return RMR.meta.retrieve('https://adfadfadfasf.ca').then(function(data) {
      assert.fail();
    }).catch(function(err) {
      expect(err).to.be.an.instanceof(Error);
    });
  });


  it('RMR og:image', function() {
    return RMR.meta.retrieve('https://readmeansrun.com/assets/img/og-image.png').then(function(data) {

      expect(data.title).to.equal(undefined); 
      expect(data['apple-touch-icon'].url).to.equal('https://readmeansrun.com/apple-touch-icon.png');
      expect(data.favicon.url).to.equal('https://readmeansrun.com/favicon.ico');
      expect(data.mime).to.equal('image/png');
      expect(data.bytes).to.equal(294);
      expect(data.url).to.equal('https://readmeansrun.com/assets/img/og-image.png');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });


  it('google.ca', function() {
    return RMR.meta.retrieve('https://google.ca').then(function(data) {

      expect(data.title).to.equal('Google'); 
      expect(data.favicon.url).to.equal('https://www.google.ca/images/branding/product/ico/googleg_lodp.ico');
      expect(data.bytes).to.equal(undefined);
      expect(data.og.email).to.equal(undefined);
      expect(data.mime).to.equal('text/html');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });


  it('wired', function() {
    return RMR.meta.retrieve('https://www.wired.com/2017/04/autodesk-project-discover/').then(function(data) {

      expect(data.title).to.equal('Autodesk\'s Project Discover Creates Floor Plans That Try to Please All Workers | WIRED'); 
      expect(data.og.title).to.equal('If an AI Doesn’t Take Your Job, It Will Design Your Office');
      expect(data.og.image.url).to.equal('https://www.wired.com/wp-content/uploads/2017/03/AI_office-1200x630-e1491340535830.jpg');
//      expect(data.favicon.url).to.equal('https://www.google.ca/images/branding/product/ico/googleg_lodp.ico');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });


  it('apple store', function() {
    return RMR.meta.retrieve('http://www.apple.com/ipad-pro/').then(function(data) {

      expect(data.title).to.equal('iPad Pro - Apple'); 
      expect(data.favicon.url).to.equal('https://www.apple.com/favicon.ico');
      expect(data.og.description).to.equal('iPad Pro delivers epic power, in 12.9-inch and 9.7-inch sizes. Discover the A9X Chip, Advanced Retina display, 12MP iSight camera, and more.');
      expect(data.mime).to.equal('text/html');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });

  it('RMR', function() {
    return RMR.meta.retrieve('http://readmeansrun.com').then(function(data) {

      expect(data.title).to.equal('READMEANSRUN'); 
      expect(data.favicon.url).to.equal('https://readmeansrun.com/favicon.ico');
      expect(data.og.description).to.equal('READMEANSRUN programs computers and takes pictures');
      expect(data.og.email).to.equal('davidfmiller@me.com');
      expect(data.description).to.equal('READMEANSRUN programs computers and takes pictures');
      expect(data.keywords).to.equal('READMEANSRUN');
      expect(data.mime).to.equal('text/html');
      expect(data.url).to.equal('https://readmeansrun.com/');

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });

  it('RMR no icons', function() {
    return RMR.meta.retrieve('http://readmeansrun.com', { icons : false }).then(function(data) {

      expect(data.favicon).to.equal(undefined);

    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });
    


});
