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
    path = require('path'),

    USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0';

/**
  Retrieve metadata from a HTML document

  @param markup {String, null} - the contents of the HTML document that will be parsed
  @param options {Object} - `baseURL` {String} - base URL that will be applied to all relative paths within the document
                            `extended` {Bool}  - if `true` external resources will be retrieved
  @return {Object} - ex:

  {
    "url" : "https://readmeansrun.com/",
    "mime" : "text/html",
    "bytes" : 23, // # of bytes
    "title": "READMEANSRUN",
    "apple-touch-icon": {
      "mime": "image/png",
      "url": "https://readmeansrun.com/apple-touch-icon.png"
    },
    "og" : {
      "email": "davidfmiller@me.com",
      "title": "READMEANSRUN",
      "description": "READMEANSRUN makes websites and takes pictures",
      "image": {
        "mime": "image/png",
        "url": "https://readmeansrun.com/assets/img/og-image.png"
      }
    },
    "favicon": {
      "mime": "image/x-icon",
      "url": "https://readmeansrun.com/favicon.ico"
    }
  }
 */
const parseMetadata = function(markup, options) {

  return new Promise(function(resolve, reject) { 

    var
      OBJ = { og : {} },
      i = 0,
      node = null,
      keyAttribute = null,
      valueAttribute = null;

    if (options.mime) {
      OBJ.mime = options.mime.split(';')[0];
    }

    if (options.bytes) {
      OBJ.bytes = options.bytes;
    }

    if (! options.baseURL) {
      options.baseURL = '/';
    }
    OBJ.url = options.baseURL;

    if (markup) {

      const
        document = parse5.parse(markup),
        xhtml = xmlser.serializeToString(document),
        doc = new DOM().parseFromString(xhtml),
        select = xpath.useNamespaces({'x': 'http://www.w3.org/1999/xhtml'}),
        metas = select('//x:meta', doc),
        links = select('//x:link', doc),
        title = select('//x:title', doc);

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
        keyAttribute = xpath.select1('@property', node) || xpath.select1('@name', node);
        valueAttribute = xpath.select1('@content', node);

        if (! keyAttribute) { continue; }
        if (! valueAttribute) { continue;  }

        valueAttribute = valueAttribute ? valueAttribute.value.trim() : null;

        if (keyAttribute.value == 'og:image' && valueAttribute) {
          OBJ.og.image = {
            mime : null,
            url : url.resolve(options.baseURL, valueAttribute)
          };
        }
        else if (keyAttribute.value == 'og:title' && valueAttribute) {
          OBJ.og.title = valueAttribute;
        }
        else if (keyAttribute.value == 'og:email' && valueAttribute) {
          OBJ.og.email = valueAttribute;
        }
        else if (keyAttribute.value == 'og:description' && valueAttribute) {
          OBJ.og.description = valueAttribute;
        }
        else if (keyAttribute.value == 'description' && valueAttribute) {
          OBJ.description = valueAttribute;
        }
        else if (keyAttribute.value == 'keywords' && valueAttribute) {
          OBJ.keywords = valueAttribute;
        }
      }

      // if we don't need the icons, resolve
      if (! options.baseURL || ! options.extended) { 
        resolve(OBJ);
      }
    }

    // loop through all external icons and ensure a fully-qualified URL is referencing them
    var
    parsed = url.parse(options.baseURL),
    addresses = {};


    if (OBJ.favicon) {
      addresses.favicon = OBJ.favicon.url;
    }
    else {
      addresses.favicon = url.resolve(parsed.protocol + '//' + parsed.hostname, '/favicon.ico');
    }

    if (OBJ.og.image) {
      addresses['og.image'] = OBJ.og.image.url;
    }

    if (OBJ['apple-touch-icon']) {
      addresses['apple-touch-icon'] = OBJ['apple-touch-icon'].url;
    }
    else {
      addresses['apple-touch-icon'] = url.resolve(parsed.protocol + '//' + parsed.hostname, '/apple-touch-icon.png');
    }

    // if no icons need to be retrieved, resolve
    if (Object.keys(addresses).length === 0) { resolve(OBJ); return; }

    // otherwise, send a HEAD request to determine their mime-type
    async.map(Object.keys(addresses), function(key, callback) {
      request.head({
        url : addresses[key],
        headers: {
          'User-Agent': USER_AGENT
        }
      }).then(function(response) {

        // if the key is nested (ex: "og.image"), 
        var bits = key.split('.');
        if (bits.length == 1) {
          OBJ[key] = { 
            mime : response['content-type'],
            url : addresses[key]
          };
        } else {
          OBJ[bits[0]][bits[1]] = { 
            mime : response['content-type'],
            url : addresses[key]
          };
        }

        callback();

      }).catch(function(e) { // if icon doesn't exist, move on
        callback();
      });

    // when all fetches are complete, resolve the promise
    }, function(err, results) {
      resolve(OBJ);
    });

  }); // end promise
};


/**
  Retrieve metadata from a URL

  @see parseMetadata
  @param address {String} - the URL whose metadata should be retrieved
  @param options {Object} - see `options` for parseMetadata 
  @throws {Error} - if the address can't be retrieved
 */
const retrieveMetadata = function(address, options) {

  var ARGS = arguments;
  if (! options) {
    options = {
      extended : true
    };
  }

  return new Promise(function(resolve, reject) {

    // send a HEAD request to determine mime-type of response
    request.head({
      url : address,
      headers : {
        'User-Agent' : USER_AGENT
      },
      resolveWithFullResponse: true
    }).then(function(response) {

      var
        mime = response.headers['content-type'],
        length = response.headers['content-length'];

      options.mime = mime;
      options.baseURL = response.request.uri.href;
      if (length) {
        options.bytes = parseInt(length, 10);
      }

      // if the resource is a page, retrieve its contents and proceed parsing
      if (mime.substring(0,9) == 'text/html') {

        request.get({
          url : address,
          headers : {
            'User-Agent' : USER_AGENT
          },
          gzip: true,
          resolveWithFullResponse: true
        }, function(err, resp, body) {

          if (err) {
            reject(err);
            return;
          }

          parseMetadata(body, options).then(function(obj) {
            resolve(obj);
          }).catch(function(err) {
            reject(err);
          });
        });

      // otherwise it's a non-html resource
      } else {

        parseMetadata(null, options).then(function(obj) {
          resolve(obj);
        }).catch(function(e) {
          reject(e);
        });
      }
    }).catch(function(err) { 
      reject(err);
    });

  });
};

/**
 Determine the mime-type for a given file

 @param filename {String} - The (complete or partial) file name whose mime-type should be determined
 @return {String} - Defaults to 'application/octet-stream'
 */
const mimeForPath = function(filename) {

  const extension = path.extname(filename);

  switch (extension) {
    case '.htm':
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.pdf':
      return 'application/pdf';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.mp3':
      return 'audio/mpeg';
    case '.mp4':
    case '.m4a':
      return 'audio/mp4';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.rss':
      return 'application/rss+xml';
    case '.txt':
    case '.md':
    case '.markdown':
      return 'text/plain';
    case '.xml':
      return 'text/xml';
    case 'atom':
      return 'application/atom+xml';
    case '.svg':
      return 'image/svg+xml';
    case '.tif':
    case '.tiff':
      return 'image/tiff';
    case '.yaml':
    case '.yml':
      return 'text/x-yaml';
  }

  return 'application/octet-stream';
};

/**
 Retrieve file extension for a given mime-type

 @param mime {String} 
 @return {String} - file extension *without* the leading `.`; `null` if no such file extension is known
 */
const extensionForMime = function(mime) {

  switch (mime) {
    case 'application/pdf':
      return 'pdf';
    case 'audio/mpeg':
    case 'audio/mpeg3':
    case 'audio/mp3':
      return 'mp3';
    case 'audio/m4a':
    case 'audio/mp4':
      return 'm4a';
    case 'text/css':
      return 'css';
    case 'text/javascript':
      return 'js';
    case 'application/json':
      return 'json';
    case 'application/rss+xml':
      return 'rss';
    case 'text/x-yaml':
      return 'yml';
    case 'text/html':
      return 'html';
    case 'application/atom+xml':
      return 'atom';
    case 'image/png':
      return 'png';
    case 'image/tiff':
      return 'tiff';
    case 'image/jpeg':
      return 'jpg';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    case 'text/xml':
    case 'application/xml':
      return 'xml';
    case 'image/vnd.microsoft.icon':
    case 'image/x-icon':
      return 'ico';
    case 'application/octet-stream':
    default:
      return null;
  }
};

/**
  Determine if a string is a valid internet URL

  @param str {String} - the string to be tested
  @return {Bool} - `true` of `false`
 */
const isURL = function(str) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
};

module.exports = {
  mime : {
    extensionFor : extensionForMime,
    fromPath : mimeForPath
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