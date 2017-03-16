

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


module.exports = {
  extensionForMime : extensionForMime
};