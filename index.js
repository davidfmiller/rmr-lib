'use strict';

function extensionForMime(mime) {

  switch (mime) {
    case 'text/html':
      return 'html';
    case 'image/png':
      return 'png';
    case 'image/tiff':
      return 'tiff';
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/gif':
      return 'gif';
    case 'image/vnd.microsoft.icon':
    case 'image/x-icon':
      return 'ico';
    default:
      return null;
  };
}

function isURL(str) {
 
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
 
  if(! pattern.test(str)) {
    return false;
  } else {
    return true;
  }
}

module.exports = {
  extensionForMime : extensionForMime,
  isURL : isURL
};