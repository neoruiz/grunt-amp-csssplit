/*
 * grunt-amp-csssplit
 * https://github.com/neoruiz/grunt-amp-csssplit
 *
 * Copyright (c) 2013 neo
 * Licensed under the MIT license.
 */
'use strict';


module.exports = function(grunt) {

  var path = require('path'),
	fs = require('fs'),
	util = require('util'),
	console = require('console'),
	bless = require('./lib/bless/parser'),
	options = {
	    cacheBuster: true,
	    cleanup: true,
	    compress: false,
	    force: true,
	    imports: true
	},
	output ;
	
	function blessParse(f, output, cb){
		new (bless.Parser)({
	        output: output,
	        options: options
	    }).parse(grunt.file.read(f), function (err, files, numSelectors) {
	        if (err) {
	            throw err;
	            cb(false);
	            process.exit(1);
	        } else {
	            try {
	                var selectorNoun = noun('selector', numSelectors);
	                numSelectors = formatNumber(numSelectors);
	                var message = 'Source CSS file contained ' + numSelectors + ' ' + selectorNoun + '.',
	                    numFiles = files.length,
	                    fileNoun = noun('file', numFiles);
	
	                if(numFiles > 1 || f != output) {
	                    for (var i in files) {
	                        var file = files[i],
	                            fd = fs.openSync(file.filename, 'w');
	                        fs.writeSync(fd, file.content, 0, 'utf8');
	                    }
	
	                    message += ' ' + numFiles + ' CSS ' + fileNoun + ' created.';
	                } else {
	                    message += ' No changes made.';
	                }
	
	
	                bless.Parser.cleanup(options, output, function(err, files) {
	                    if (err) {
	                        throw err;
	                        process.exit(1);
	                    } else {
	                        var oldVerb;
	
	                        for (var i in files) {
	                            var file = files[i];
	
	                            if(! options.cleanup) {
	                                oldVerb = 'renamed';
	                                var ext = path.extname(file),
	                                    dest = file.replace(ext, '-old' + ext),
	                                    read = fs.createReadStream(file),
	                                    write = fs.createWriteStream(dest);
	
	                                read.on('end', function (err) {
	                                    if (err) {
	                                        throw err;
	                                        process.exit(1);
	                                    }
	                                });
	
	                                util.pump(read, write);
	                            } else {
	                                oldVerb = 'removed';
	                            }
	
	                            fs.unlink(files[i], function (err) {
	                                if (err) {
	                                    throw err;
	                                    process.exit(1);
	                                }
	                            });
	                        }
	
	                        var numOld = files.length;
	
	                        if (numOld > 0) {
	                            var removedFileNoun = noun('file', numOld);
	                            message += ' Additional CSS ' + removedFileNoun + ' no longer needed. ' + numOld + ' additional ' + removedFileNoun + ' ' + oldVerb + '.';
	                        }
	
	                        console.log('AMP CSS SPLIT: ' + message);
	                        cb(true);
	                    }
	                });
	                
	            } catch (e) {
	                throw e;
	                process.exit(2);
	            }
	        }
	    });
	}

  grunt.registerMultiTask('amp_csssplit', 'Split CSS files to support IE', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });
    
    var options = this.options();
    var cb = this.async();

    // Iterate over all specified file groups.
    this.files.forEach(function(o) {
      o.orig.src.forEach(function(f) {
    	  if (!grunt.file.exists(f)) {
              grunt.log.warn('Source file "' + filepath + '" not found.');
              return false;
            } else {
            	output = f;
            	blessParse(f, output, cb)
            }
      });
    });
  });
};


function noun(noun, variable) {
    if (variable != 1) {
        noun += 's';
    }
    return noun;
}

function formatNumber (nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';

    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    return x1 + x2;
}






