/* global require, module, console, Promise */

const
    xpath = require('xpath'),
    parse5 = require('parse5'),
    xmlser = require('xmlserializer'),
    url = require('url'),
    async = require('async'),
    process = require('process'),
    DOM = require('xmldom').DOMParser,
    request = require('request-promise-native'),

    USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0';

/**

   @param markup {String} - the contents of the HTML document that will be parsed
   @param baseURL {String} - (optional) the base URL that should be applied to all relative paths within the document
 */
const parseMetadata = function(markup, options) {

  return new Promise(function(resolve, reject) { 

    const
      document = parse5.parse(markup),
      xhtml = xmlser.serializeToString(document),
      doc = new DOM().parseFromString(xhtml),
      select = xpath.useNamespaces({'x': 'http://www.w3.org/1999/xhtml'}),
      metas = select('//x:meta', doc),
      links = select('//x:link', doc),
      title = select('//x:title', doc);

    if (! options.baseURL) {
      options.baseURL = '/';
    }

    var
      OBJ = {},
      i = 0,
      node = null,
      keyAttribute = null,
      valueAttribute = null;

    if (title && title.length) {
      OBJ.title = title[0].firstChild.nodeValue;
    }

    for (i in links) {

      node = links[i];
      keyAttribute = xpath.select1('@rel', node);
      valueAttribute = xpath.select1('@href', node);

      if (! keyAttribute) { continue; }

      if (keyAttribute.value == 'shortcut icon' && valueAttribute) {
        OBJ.favicon = {
          mime : null,
          url : url.resolve(options.baseURL, valueAttribute.value)
        };
      }
      else if (keyAttribute.value == 'apple-touch-icon' && valueAttribute) {
        OBJ['apple-touch-icon'] = {
          mime : null,
          url : url.resolve(options.baseURL, valueAttribute.value)
        };
      }
      else if (keyAttribute.value == 'canonical' && valueAttribute) {
        OBJ.canonical = valueAttribute.value;
      }
    }

    for (i in metas) {
      node = metas[i];
      keyAttribute = xpath.select1('@property', node);
      valueAttribute = xpath.select1('@content', node);

      if (! keyAttribute) { continue; }

      if (keyAttribute.value == 'og:image' && valueAttribute) {
        OBJ['og:image'] = {
          mime : null,
          url : url.resolve(options.baseURL, valueAttribute.value)
        };
      }
      else if (keyAttribute.value == 'og:title' && valueAttribute) {
        OBJ['og:title'] = valueAttribute.value;
      }
      else if (keyAttribute.value == 'og:description' && valueAttribute) {
        OBJ['og:description'] = valueAttribute.value;
      }
    }

    // if we don't need the icons, resolve
    if (! options.baseURL || ! options.icons) { 
      resolve(OBJ);
    }

    var
    parsed = url.parse(options.baseURL),
    addresses = {};

    if (OBJ.favicon) {
      addresses.favicon = OBJ.favicon.url;
    }
    else {
      addresses.favicon = url.resolve(parsed.protocol + '//' + parsed.hostname, '/favicon.ico');
    }

    if (OBJ['og:image']) {
      addresses['og:image'] = OBJ['og:image'].url;
    }

    if (OBJ['apple-touch-icon']) {
      addresses['apple-touch-icon'] = OBJ['apple-touch-icon'].url;
    }
    else {
      addresses['apple-touch-icon'] = url.resolve(parsed.protocol + '//' + parsed.hostname, '/apple-touch-icon.png');
    }

    // if both icons have been retrieved, resolve
    if (Object.keys(addresses).length === 0) { resolve(OBJ); }

    async.map(Object.keys(addresses), function(key, callback) {
      request.head({
        url : addresses[key],
        headers: {
          'User-Agent': USER_AGENT
        }
      }).then(function(response) {

        OBJ[key] = { 
          mime : response['content-type'],
          url : addresses[key]
        };

        callback();
      }).catch(function(e) { // if icon doesn't exist, move on

        callback();
      });
    }, function(err, results) {
      resolve(OBJ);
    });

  }); // end promise
};


/**

  @param url {String} - 
  @param options {Object} - 
 */
const retrieveMetadata = function(address, options) {

  // TODO http://stackoverflow.com/questions/16687618/how-do-i-get-the-redirected-url-from-the-nodejs-request-module

  return new Promise(function(resolve, reject) {
    request.get({
      url : address,
      headers : {
        'User-Agent' : USER_AGENT
      }
    }).then(function(markup, response) {

      console.log(response);

      parseMetadata(markup, options ? options : { baseURL : address, icons : true }).then(function(obj) {
        resolve(obj);
      });
    }).catch(function(e) {
      reject(e);
    });
  });
};


const extensionForMime = function(mime) {

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
  }
};

const isURL = function(str) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
};

module.exports = {
  mime : {
    extensionFor : extensionForMime
  },
  url : {
    isA : isURL,
  },
  meta : {
    parse : parseMetadata,
    retrieve : retrieveMetadata
  }
};

/*
if (require.main === module) {
 
  if (process.argv.length == 3) {
    retrieveMetadata(process.argv[2]).then(function(meta) {
      console.log(JSON.stringify(meta));
    }).catch(function(err) {
      console.log('🚫  ' + err);
    });
  } else {
    console.log('🚫  No URL provided');
  }
}
*/