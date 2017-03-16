const
  assert = require('assert'),
  RMR = require('./index'),
  chai = require('chai'),
  expect = chai.expect;

describe('rmr-lib', function() {
//  this.timeout(10000);

  it('mimes', function() {

    expect(RMR.extensionForMime('text/html')).to.equal('html');
    expect(RMR.extensionForMime('asdfadsf')).to.equal(null);
  
//    return meta.retrieve('http://readmeansrun.com', { icons : false }).then(function(data) {
//      expect(data.favicon).to.equal(undefined);
//    }).catch(function(m) { console.log(m); throw new Error(m.toString()); });
  });
    


});
