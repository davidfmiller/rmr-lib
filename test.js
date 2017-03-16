const
  assert = require('assert'),
  RMR = require('./index'),
  chai = require('chai'),
  expect = chai.expect;

describe('rmr-lib', function() {
//  this.timeout(10000);

  it('mimes', function() {

    expect(RMR.extensionForMime('image/png')).to.equal('png');
    expect(RMR.extensionForMime('image/tiff')).to.equal('tiff');
    expect(RMR.extensionForMime('image/jpg')).to.equal('jpg');
    expect(RMR.extensionForMime('image/jpeg')).to.equal('jpg');
    expect(RMR.extensionForMime('image/gif')).to.equal('gif');
    expect(RMR.extensionForMime('image/vnd.microsoft.icon')).to.equal('ico');
    expect(RMR.extensionForMime('image/x-icon')).to.equal('ico');
    
    expect(RMR.extensionForMime('text/html')).to.equal('html');
    expect(RMR.extensionForMime('asdfadsf')).to.equal(null);
  });

  it('isURL', function() {

    expect(RMR.isURL('http://google.com')).to.equal(true);
    expect(RMR.isURL('https://google.com')).to.equal(true);

    expect(RMR.isURL('https://google.com')).to.equal(true);
  });


});
