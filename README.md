[![Known Vulnerabilities](https://snyk.io/test/npm/rmr-lib/badge.svg)](https://snyk.io/test/npm/rmr-lib) [![Build Status](https://travis-ci.org/davidfmiller/rmr-lib.svg?branch=master)](https://travis-ci.org/davidfmiller/rmr-lib) [![Coverage Status](https://coveralls.io/repos/github/davidfmiller/rmr-lib/badge.svg?branch=master)](https://coveralls.io/github/davidfmiller/rmr-lib?branch=master) [![dependencies Status](https://david-dm.org/davidfmiller/rmr-lib/status.svg)](https://david-dm.org/davidfmiller/rmr-lib) [![devDependencies Status](https://david-dm.org/davidfmiller/rmr-lib/dev-status.svg)](https://david-dm.org/davidfmiller/rmr-lib?type=dev) [![Documentation Status](https://readthedocs.org/projects/rmr-lib/badge/?version=latest)](http://rmr-lib.readthedocs.io/en/latest/?badge=latest)


# rmr-lib

A well-tested library of code for working with internet metadata:

    const
      RMR = require('rmr-lib'),
      mime = RMR.mime.fromPath('script.js')), // 'text/javascript'
      ext = RMR.mime.extensionFor('application/json'), // 'json'
      isURL = RMR.url.isA('https://google.com'), // true 
      RMR.meta.retrieve('http://readmeansrun.com').then(function(data) {
        /*{
          "title": "READMEANSRUN",
          "keywords": "rmr",
          "description": "READMEANSRUN makes websites and takes pictures",
          "apple-touch-icon": {
            "mime": "image/png",
            "url": "https://readmeansrun.com/apple-touch-icon.png"
          },
          "og:title": "READMEANSRUN",
          "og:description": "READMEANSRUN makes websites and takes pictures",
          "og:image": {
            "mime": "image/png",
            "url": "https://readmeansrun.com/assets/img/og-image.png"
          },
          "favicon": {
            "mime": "image/x-icon",
            "url": "https://readmeansrun.com/favicon.ico"
          }
        }*/
      }).catch(function(err)) {
        console.log('🚫', err);
      };